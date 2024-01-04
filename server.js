import express from "express";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";
import { uploadFile, deleteFile, getObjectSignedUrl } from "./s3.js";
import * as cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_ACCESS_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_ACCESS_KEY,
  secure: true,
});

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

app.get("/", async (req, res) => {
  res.send("Hello! I can encrypt things.");
});

app.post("/image", upload.single("image"), async (req, res) => {
  const file = req.file;
  const caption = req.body.caption;
  const imageName = generateFileName();

  const fileBuffer = await sharp(file.buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer();

  if (req.file) {
    let cld_upload_stream = cloudinary.uploader.upload_stream(
      { folder: "test" },
      function (error, result) {
        console.log(error, result);
        res.json({ public_id: result.public_id, url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
  }

  await uploadFile(fileBuffer, imageName, file.mimetype);

  res.status(201).send(post);
});

// app.get("/api/all", async (req, res) => {
//   const posts = await prisma.posts.findMany({ orderBy: [{ created: "desc" }] });
//   for (let post of posts) {
//     post.imageUrl = await getObjectSignedUrl(post.imageName);
//   }
//   res.send(posts);
// });

// app.post("/api/posts", upload.single("image"), async (req, res) => {
//   const file = req.file;
//   const caption = req.body.caption;
//   const imageName = generateFileName();

//   const fileBuffer = await sharp(file.buffer)
//     .resize({ height: 1920, width: 1080, fit: "contain" })
//     .toBuffer();

//   await uploadFile(fileBuffer, imageName, file.mimetype);

//   const post = await prisma.posts.create({
//     data: {
//       imageName,
//       caption,
//     },
//   });

//   res.status(201).send(post);
// });

// app.delete("/api/posts/:id", async (req, res) => {
//   const id = +req.params.id;
//   const post = await prisma.posts.findUnique({ where: { id } });

//   await deleteFile(post.imageName);

//   res.send(post);
// });

app.listen(8080, () => console.log("listening on port 8080"));
