/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/features/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            // TCS iON CAT Exam Color Palette
            colors: {
                // Header & Footer
                'exam-header': {
                    from: '#2c3e50',
                    to: '#34495e',
                    border: '#1a252f',
                },
                // Section Colors
                'section': {
                    varc: '#3498db',
                    dilr: '#2ecc71',
                    qa: '#e74c3c',
                    inactive: '#ecf0f1',
                },
                // Question Status Colors
                'status': {
                    answered: '#4caf50',
                    'answered-dark': '#388e3c',
                    marked: '#9c27b0',
                    'marked-dark': '#7b1fa2',
                    visited: '#e53935',
                    'visited-dark': '#c62828',
                    current: '#3498db',
                    'current-dark': '#2980b9',
                    'not-visited': '#ffffff',
                    border: '#bdc3c7',
                },
                // Timer & Accent
                'timer': '#f39c12',
                // Text Colors
                'exam-text': {
                    primary: '#212529',
                    secondary: '#495057',
                    muted: '#7f8c8d',
                    body: '#333333',
                },
                // Background Colors
                'exam-bg': {
                    page: '#f5f5f5',
                    pane: '#f8f9fa',
                    white: '#ffffff',
                    border: '#dee2e6',
                    'border-light': '#e9ecef',
                },
            },
            // Custom font family for exam
            fontFamily: {
                'exam': ["'Segoe UI'", 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            },
            // Fixed heights matching TCS iON
            height: {
                'header': '60px',
                'section-bar': '48px',
                'metadata-bar': '40px',
                'footer': '50px',
                'btn': '42px',
                'q-btn': '48px',
            },
            // Custom spacing
            spacing: {
                '4.5': '18px',
                '7.5': '30px',
            },
            // Line heights
            lineHeight: {
                'exam': '1.6',
            },
        },
    },
    plugins: [],
};
