import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

let configured = false;

function configureCloudinary() {
  if (configured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export async function uploadProductImage(file: File, slug: string, index: number) {
  configureCloudinary();

  const bytes = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "treshatrendy/products",
        public_id: `${slug}-${timestamp}-${index}`,
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result);
      },
    );

    stream.end(bytes);
  });
}
