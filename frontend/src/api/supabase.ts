import { createClient } from '@supabase/supabase-js';

// Vite exposes env via import.meta.env (not process.env)
const url = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string;
const bucket = ((import.meta as any).env?.VITE_SUPABASE_AVATARS_BUCKET as string) || 'avatars';

if (!url || !anon) {
  console.error('Supabase env missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anon);

export async function uploadAvatarToSupabase(userId: number, file: File) {
  if (!url || !anon) {
    throw new Error('Supabase environment not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filename = `${userId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}
