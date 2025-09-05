import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function logger({ level, lineId, message, context }) {
    // const context = typeof contextStr === 'object' ? JSON.stringify(contextStr, Object.getOwnPropertyNames(contextStr)) : String(contextStr)
    const { error } = await supabase
    .from('logs')
    .insert([{ level, lineId, message, context }]);
    if (error) console.error('ログ保存エラー:', error.message);
}