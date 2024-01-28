import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});
api.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `${localStorage.getItem("token")}`;
    return config;
  },
  (error) => Promise.reject(error)
);
export { api };
