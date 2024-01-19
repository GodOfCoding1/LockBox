import * as cloudinary from "cloudinary";
import * as streamifier from "streamifier";

export const uploadImage = (buffer) =>
  new Promise((reslove, reject) => {
    const cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "corrupted-images",
        resource_type: "raw",
      },
      function (error, result) {
        if (error) reject(error);
        reslove(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
