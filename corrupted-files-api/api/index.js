import { Router } from "express";
import {
  addFile,
  deleteFileById,
  getDecodedFileById,
  getFileIds,
} from "../controllers/file-controller.js";
import multer from "multer";
import { getUserInfo, login } from "../controllers/user-controller.js";
import { passportMiddlerwareWrapper } from "../middlewares/passport.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

//files
router
  .route("/file/id")
  .all(passportMiddlerwareWrapper("jwt"))
  .get(getFileIds);
router
  .route("/file/")
  .all(passportMiddlerwareWrapper("jwt"))
  .all(upload.single("file"))
  .post(addFile);
router
  .route("/file/:id")
  .all(passportMiddlerwareWrapper("jwt"))
  .delete(deleteFileById);
router
  .route("/file/:id/:password")
  .all(passportMiddlerwareWrapper("jwt"))
  .get(getDecodedFileById);

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
