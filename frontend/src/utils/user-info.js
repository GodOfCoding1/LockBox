import { api } from "./axios";

const isLoggedin = async () => {
  try {
    await api.get("/user/info");
    return true;
  } catch (error) {
    return false;
  }
};

const userInfo = async () => {
  try {
    const res = await api.get("/user/info");
    return res.data.user;
  } catch (error) {
    return Error("some error occured");
  }
};

export { isLoggedin, userInfo };
