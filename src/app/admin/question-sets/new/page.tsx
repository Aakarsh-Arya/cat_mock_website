/**
 * @fileoverview New Question Set Page
 * @description Create a new question set with passage/context and questions
 * @blueprint Question Container Architecture
 */

import { sbSSR } from '@/lib/supabase/server';
import { NewQuestionSetClient } from './NewQuestionSetClient';

export default async function NewQuestionSetPage() {
    const supabase = await sbSSR();

    // Fetch all papers for the dropdown
    const { data: papers } = await supabase
        .from('papers')
        .select('id, title, slug')
        .order('created_at', { ascending: false });

    return <NewQuestionSetClient papers={papers ?? []} />;
}
