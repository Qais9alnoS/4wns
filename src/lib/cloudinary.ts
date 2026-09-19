import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/** Uploads a base64/data-URI or remote file to Cloudinary under the band's folder. */
export async function uploadToCloudinary(
  file: string,
  folder: 'gallery' | 'events',
  resourceType: 'image' | 'video' = 'image'
) {
  console.log('Cloudinary config check:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing',
  });

  const timestamp = Date.now();
  const publicId = `arb3awnoss/${folder}/${timestamp}`;

  console.log('Upload params:', {
    public_id: publicId,
    resource_type: resourceType,
    file_size: file.length,
  });

  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
    });
    console.log('Upload successful:', result.public_id);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error: any) {
    console.error('Cloudinary upload detailed error:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      body: error.http ? error.http.body : 'no body',
    });
    throw error;
  }
}

/** Deletes an asset from Cloudinary by its public ID. */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete failed:', err);
  }
}
