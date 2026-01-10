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

async function deleteFromSupabase(fullUrl) {
  try {
    if (!fullUrl) return;

    // 1. Extract the file path from the full URL
    // URL: https://[project].supabase.co/storage/v1/object/public/recipes/thumbnails/image.jpg
    // We need: "thumbnails/image.jpg"
    
    // Split by the bucket name ('recipes') to get the relative path
    const path = fullUrl.split('/recipes/')[1]; 
    if (!path) return; // Not a valid Supabase URL for this bucket

    // 2. Remove the file
    const { error } = await supabase
      .storage
      .from('recipes')
      .remove([path]);

    if (error) throw error;
    
    console.log(`Deleted old image: ${path}`);
  } catch (err) {
    // We log this but usually don't throw an error to the user
    // because the main "Save" action succeeded.
    console.error("Failed to delete old image:", err.message);
  }
}

module.exports = { uploadToSupabase, deleteFromSupabase };