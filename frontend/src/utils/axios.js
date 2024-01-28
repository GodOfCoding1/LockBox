import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});
api.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `${localStorage.getItem("token")}`;
    return config;
  },
  (error) => Promise.reject(error)
);
export { api };
