import cloudinary from '../config/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
      },
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload failed with no result or error'));
        }
      }
    );
    stream.end(buffer);
  });
};
