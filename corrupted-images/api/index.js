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

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/images").get(getAllImages);
router.route("/images/id").get(getImageIds);
router.route("/image/").all(upload.single("file")).post(addImage);
router.route("/image/:id").delete(deleteImageById);
router
  .route("/image/:id/:password")
  .get(getDecodedImageById)
  .delete(deleteImageById);

export default router;
