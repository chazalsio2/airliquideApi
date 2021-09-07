import { v2 as cloudinary } from "cloudinary";
import util from "util";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadPhoto(photo) {
  const upload = util.promisify(cloudinary.uploader.upload);
  const result = await upload(`${photo.fileData}`, {
   // transformation: ["visionr_watermark"],
    folder: process.env.NODE_ENV
  });
  return result;
}

export async function uploadPhotos(photos) {
  const results = await Promise.all(photos.map(uploadPhoto));
  return results;
}
