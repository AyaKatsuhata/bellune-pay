import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function logger({ level, lineId, message, context }) {
    const context = typeof context === 'object' ? JSON.stringify(context, Object.getOwnPropertyNames(context)) : String(context)

    const { error } = await supabase
    .from('logs')
    .insert([{ level, lineId, message, context }]);
    if (error) console.error('ログ保存エラー:', error.message);
}