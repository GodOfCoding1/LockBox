import { WebSocketServer } from "ws";
import queryString from "query-string";
import { allImages, getImagesCount } from "./controllers/image-controller.js";
import { EVENTS } from "./constants.js";
import { decryptRawBuffer } from "./helpers/encryption.js";
import jwt from "jsonwebtoken";
import url from "url";
import User from "./models/user.js";

const decodeImages = async (
  userId,
  encrypted_private_key_url,
  password,
  sendImage
) => {
  const privateKey = await fetch(encrypted_private_key_url);
  const privateKeyBuffer = Buffer.from(await privateKey.arrayBuffer());
  const images = await allImages(userId);
  images.forEach(async (image) => {
    const imageBufferRes = await fetch(image.url);
    const imageBuffer = await decryptRawBuffer(
      Buffer.from(await imageBufferRes.arrayBuffer()),
      privateKeyBuffer,
      image.hash,
      password
    );
    sendImage({ id: image._id, buffer: imageBuffer });
  });
};

const sendResponse = (event, data, conn) =>
  conn.send(
    JSON.stringify({
      event,
      data,
    })
  );
const sendError = (message, conn) =>
  conn.send(
    JSON.stringify({
      event: EVENTS.ERROR,
      message,
    })
  );
const authenticate = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    return decoded.user;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const notLoggedIn = (socket) => {
  socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
  socket.destroy();
};

export default async (expressServer) => {
  const websocketServer = new WebSocketServer({
    noServer: true,
    path: "/websocket",
  });

  expressServer.on("upgrade", (request, socket, head) => {
    const { token } = url.parse(request.url, true).query;
    if (!token) return notLoggedIn(socket);
    const user = authenticate(token);
    if (!user) return notLoggedIn(socket);

    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      request.user = user;
      websocketServer.emit("connection", websocket, request);
    });
  });

  websocketServer.on("connection", function connection(conn, req) {
    // NOTE: connectParams are not used here but good to understand how to get
    // to them if you need to pass data with the connection to identify it (e.g., a userId).
    conn.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.event == EVENTS.COUNT_IMAGES) {
          return sendResponse(
            EVENTS.COUNT_IMAGES,
            await getImagesCount(req.user.id),
            conn
          );
        }
        if (parsedMessage.event == EVENTS.DECODE_IMAGES) {
          if (!parsedMessage.password) {
            return sendError("No password provided", conn);
          }
          const user = await User.findById(req.user.id);
          if (await user.matchMasterPassword(parsedMessage.password)) {
            sendResponse(
              EVENTS.DECODE_STARTED,
              { message: "Decoding started..." },
              conn
            );
          } else {
            return sendError("incorrect master password", conn);
          }
          return decodeImages(
            req.user.id,
            user.encrypted_private_key_url,
            parsedMessage.password,
            (data) => sendResponse(EVENTS.DECODE_IMAGES, data, conn)
          );
        }
        return sendError("Invalid Event");
      } catch (error) {
        console.log(error);
        sendError(error.message);
      }
    });
  });

  return websocketServer;
};
