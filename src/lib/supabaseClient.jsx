import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANTE: En producción, esto debe ir en variables de entorno (.env)
// Por ahora, para desarrollo, pega tus claves aquí.
const supabaseUrl = 'https://tpeslrsyrgqebrbwxnde.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZXNscnN5cmdxZWJyYnd4bmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzAwOTQsImV4cCI6MjA3OTY0NjA5NH0.ZVazhOcZdbPfEwIO-g9geNkmLL7oB4IKQ-qP62GWa9s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);