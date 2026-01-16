
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fgcvtylldhqitatbbbst.supabase.co'
const supabaseKey = 'sb_publishable_Fy5QJQcE6lFv61v4QJRLhg_yICxlTW6'

export const supabase = createClient(supabaseUrl, supabaseKey)
