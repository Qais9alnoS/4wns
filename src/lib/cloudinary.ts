import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 180_000,
});

export default cloudinary;

type ResourceType = 'image' | 'video';

function uploadOptions(
  folder: 'gallery' | 'events',
  resourceType: ResourceType
): UploadApiOptions {
  return {
    public_id: `arb3awnoss/${folder}/${Date.now()}`,
    resource_type: resourceType,
    overwrite: true,
    timeout: 180_000,
    chunk_size: 6_000_000,
  };
}

function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error || new Error('Cloudinary returned an empty result'));
        return;
      }
      resolve(result);
    });
    stream.end(buffer);
  });
}

/** Uploads a file buffer or data-URI to Cloudinary under the band's folder. */
export async function uploadToCloudinary(
  file: string | Buffer,
  folder: 'gallery' | 'events',
  resourceType: ResourceType = 'image'
) {
  const options = uploadOptions(folder, resourceType);

  console.log('Upload params:', {
    public_id: options.public_id,
    resource_type: resourceType,
    file_size: Buffer.isBuffer(file) ? file.length : file.length,
  });

  try {
    const result = Buffer.isBuffer(file)
      ? await uploadBuffer(file, options)
      : await cloudinary.uploader.upload(file, options);
    console.log('Upload successful:', result.public_id);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error: unknown) {
    const err = error as { message?: string; http_code?: number; name?: string; error?: { message?: string } };
    console.error('Cloudinary upload detailed error:', {
      message: err.message || err.error?.message,
      http_code: err.http_code,
      name: err.name,
    });
    throw error;
  }
}

/** Deletes an asset from Cloudinary by its public ID. */
export async function deleteFromCloudinary(publicId: string, resourceType: ResourceType = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete failed:', err);
  }
}
