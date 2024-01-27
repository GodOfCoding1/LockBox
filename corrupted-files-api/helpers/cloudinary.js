import * as cloudinary from "cloudinary";
import * as streamifier from "streamifier";

export const uploadRaw = (folder, buffer) =>
  new Promise((reslove, reject) => {
    const cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
      },
      function (error, result) {
        if (error) reject(error);
        reslove(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });

export const deleteRaw = (public_id) =>
  new Promise((reslove, reject) => {
    cloudinary.v2.uploader.destroy(
      public_id,
      {
        resource_type: "raw",
      },
      function (error, result) {
        if (error) reject(error);
        reslove(result);
      }
    );
  });
