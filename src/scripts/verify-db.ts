import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url!, key!);

async function test() {
    const { data, error } = await supabase.from('meal_slots').select('*').limit(1);
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Meal Slots Table Exists. Data:', data);
    }
}

test();
