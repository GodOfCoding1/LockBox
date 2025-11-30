import { Router } from "express";
import {
  addImage,
  deleteImageById,
  getDecodedImageById,
  getImageIds,
} from "../controllers/image-controller.js";
import multer from "multer";
import { getUserInfo, login } from "../controllers/user-controller.js";
import { passportMiddlerwareWrapper } from "../middlewares/passport.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

//images (backward compatibility - now supports any file type)
router
  .route("/image/id")
  .all(passportMiddlerwareWrapper("jwt"))
  .get(getImageIds);
router
  .route("/image/")
  .all(passportMiddlerwareWrapper("jwt"))
  .all(upload.single("file"))
  .post(addImage);
router
  .route("/image/:id")
  .all(passportMiddlerwareWrapper("jwt"))
  .delete(deleteImageById);
router
  .route("/image/:id/:password")
  .all(passportMiddlerwareWrapper("jwt"))
  .get(getDecodedImageById);

//files (generic routes for any file type including MP3)
router
  .route("/file/id")
  .all(passportMiddlerwareWrapper("jwt"))
  .get(getImageIds);
router
  .route("/file/")
  .all(passportMiddlerwareWrapper("jwt"))
  .all(upload.single("file"))
  .post(addImage);
router
  .route("/file/:id")
  .all(passportMiddlerwareWrapper("jwt"))
  .delete(deleteImageById);
router
  .route("/file/:id/:password")
  .all(passportMiddlerwareWrapper("jwt"))
  .get(getDecodedImageById);

//user
router
  .route("/user/register")
  .all(passportMiddlerwareWrapper("local-signup"))
  .post(getUserInfo);
router
  .route("/user/login")
  .all(passportMiddlerwareWrapper("local-login"))
  .post(login);
router
  .route("/user/info")
  .all(passportMiddlerwareWrapper("jwt"))
  .get(getUserInfo);
export default router;
