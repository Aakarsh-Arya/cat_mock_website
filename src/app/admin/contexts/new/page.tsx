/**
 * @fileoverview New Context Page (Deprecated)
 * @description Deprecated after sets-first authoring. Redirects to question sets.
 */

import { redirect } from 'next/navigation';

export default function NewContextPage() {
    redirect('/admin/question-sets');
}
