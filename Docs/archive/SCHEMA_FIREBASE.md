# Firebase Firestore Schema (Fallback Option)

## Overview
This document outlines the Firestore database structure as a fallback to Supabase. Firestore uses a document-based NoSQL structure with collections and subcollections.

## Collections Structure

### /users/{userId}
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### /papers/{paperId}
```json
{
  "title": "CAT 2024 Paper",
  "year": 2024,
  "totalQuestions": 66,
  "durationMinutes": 180,
  "sections": [
    {"name": "VAR", "questions": 24, "timeMinutes": 40},
    {"name": "DILR", "questions": 20, "timeMinutes": 40},
    {"name": "QA", "questions": 22, "timeMinutes": 40}
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### /papers/{paperId}/questions/{questionId}
```json
{
  "section": "VAR",
  "questionNumber": 1,
  "questionText": "What is the probability...",
  "questionType": "MCQ", // or "TITA"
  "options": ["Option A", "Option B", "Option C", "Option D"], // null for TITA
  "correctAnswer": "A", // or "42" for TITA
  "solutionText": "The correct answer is A because...",
  "solutionImageUrl": "https://storage.googleapis.com/bucket/solution1.png",
  "difficulty": "medium",
  "topic": "Probability",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### /users/{userId}/attempts/{attemptId}
```json
{
  "paperId": "paper123",
  "startedAt": "2025-01-01T10:00:00Z",
  "completedAt": null,
  "status": "in_progress", // "in_progress", "completed", "abandoned"
  "currentSection": "VAR",
  "timeRemaining": {
    "VAR": 2400, // seconds
    "DILR": 2400,
    "QA": 2400
  },
  "totalScore": null,
  "sectionScores": null,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}
```

### /users/{userId}/attempts/{attemptId}/responses/{questionId}
```json
{
  "questionId": "question123",
  "answer": "A",
  "isMarkedForReview": false,
  "timeSpentSeconds": 45,
  "createdAt": "2025-01-01T10:00:45Z",
  "updatedAt": "2025-01-01T10:00:45Z"
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read papers (public)
    match /papers/{paperId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }

    // Users can read questions (public)
    match /papers/{paperId}/questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }

    // Users can manage their own attempts
    match /users/{userId}/attempts/{attemptId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can manage their own responses
    match /users/{userId}/attempts/{attemptId}/responses/{questionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Indexes Required

### Automatic Indexes
Firestore automatically creates indexes for simple queries.

### Composite Indexes Needed
- `papers/{paperId}/questions` on `section` (for section filtering)
- `users/{userId}/attempts` on `status` (for filtering active attempts)
- `users/{userId}/attempts` on `startedAt` (for attempt history)

## Migration Notes

### From Supabase to Firestore
- UUIDs become Firestore document IDs
- Foreign keys become reference paths
- JSON fields become nested objects
- RLS policies become Firestore security rules

### Data Export/Import
- Use Firestore Admin SDK for bulk operations
- Export from Supabase as JSON, transform, import to Firestore
- Handle image URLs (Supabase Storage → Firebase Storage)

## Cost Considerations

### Free Tier Limits
- 50k reads/day
- 20k writes/day
- 1GB storage
- 10GB/month egress

### Usage Estimation
- 200 users × 6 saves/min × 60 min = 72k writes/hour (exceeds free limit)
- Need to reduce autosave frequency (every 15-30 seconds instead of 10)

## Advantages over Supabase
- Better offline support
- Real-time listeners built-in
- Simpler client-side integration

## Disadvantages vs Supabase
- Fixed daily quotas (vs Supabase's flexible throughput limits)
- No built-in SQL queries
- More complex data modeling