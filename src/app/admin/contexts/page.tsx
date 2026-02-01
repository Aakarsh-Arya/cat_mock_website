/**
 * @fileoverview Contexts List Page (Deprecated)
 * @description Deprecated after sets-first authoring. Redirects to question sets.
 */

import { redirect } from 'next/navigation';

export default function ContextsPage() {
    redirect('/admin/question-sets');
}
