const { supabase } = require('../config/supabaseClient');

/**
 * Helper function to upload file buffer to Supabase Storage
 * @param {Object} file - The Multer file object
 * @param {string} bucket - The Supabase bucket name (e.g., 'recipes')
 * @param {string} folder - The folder path inside the bucket (e.g., 'thumbnails')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
async function uploadToSupabase(file, bucket = 'cookie-media', folder) {
  try {
    const orig = file.originalname.split('.').pop();
    const ext = (path.extname(orig) || '').toLowerCase().replace('.', '') || 'png';
    const objectPath = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase
      .storage
      .from(bucket)
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
        cacheControl: '3600',
      });

    if (error) throw error;

    // Get the Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(objectPath);

    return publicUrl;
  } catch (err) {
    console.error("Supabase Upload Error:", err);
    throw new Error("SUPABASE_UPLOAD_FAILED");
  }
}

module.exports = { uploadToSupabase };