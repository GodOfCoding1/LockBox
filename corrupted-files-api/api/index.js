import { Router } from "express";
import {
  addImage,
  deleteImageById,
  getAllImages,
  getDecodedImageById,
  getImageById,
  getImageIds,
} from "../controllers/image-controller.js";
import multer from "multer";
import { getUserInfo, login } from "../controllers/user-controller.js";
import passport from "passport";
import { passportMiddlerwareWrapper } from "../middlewares/passport.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

//images
router.route("/images").get(getAllImages);
router.route("/images/id").get(getImageIds);
router.route("/image/").all(upload.single("file")).post(addImage);
router.route("/image/:id").delete(deleteImageById);
router
  .route("/image/:id/:password")
  .get(getDecodedImageById)
  .delete(deleteImageById);

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
  .all(passport.authenticate("jwt", { session: false }))
  .get(getUserInfo);
export default router;
