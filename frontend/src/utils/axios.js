import axios from "axios";
import { getToken } from "./user-info";

const CorruptedFileInstance = axios.create({
  baseURL: "/api",
});

const addToken = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

CorruptedFileInstance.interceptors.request.use(addToken);

export const postFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
  try {
    const res = await CorruptedFileInstance.post("/file/", formData, config);
    return { success: true, data: res.data };
  } catch (err) {
    console.log(err);
    return { success: false, error: err.response.data };
  }
};

export { CorruptedFileInstance as api };
