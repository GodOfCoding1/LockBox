import { WebSocketServer } from "ws";
import queryString from "query-string";
import { allImages, getImagesCount } from "./controllers/image-controller.js";
import { EVENTS } from "./constants.js";
import { decryptImageBuffer } from "./helpers/encryption.js";

const decodeImages = async (password, sendImage) => {
  const images = await allImages();
  images.forEach(async (image) => {
    const imageBufferRes = await fetch(image.url);
    const imageBuffer = await decryptImageBuffer(
      Buffer.from(await imageBufferRes.arrayBuffer()),
      image.hash,
      password
    );
    sendImage({ id: image._id, buffer: imageBuffer });
  });
};

export default async (expressServer) => {
  const websocketServer = new WebSocketServer({
    noServer: true,
    path: "/websocket",
  });

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  websocketServer.on(
    "connection",
    function connection(websocketConnection, connectionRequest) {
      const [_path, params] = connectionRequest?.url?.split("?");
      const connectionParams = queryString.parse(params);
      const sendResponse = (event, data) =>
        websocketConnection.send(
          JSON.stringify({
            event,
            data,
          })
        );
      const sendError = (message) =>
        websocketConnection.send(
          JSON.stringify({
            event: EVENTS.ERROR,
            message,
          })
        );

      // NOTE: connectParams are not used here but good to understand how to get
      // to them if you need to pass data with the connection to identify it (e.g., a userId).
      websocketConnection.on("message", async (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.event == EVENTS.COUNT_IMAGES) {
            return sendResponse(EVENTS.COUNT_IMAGES, await getImagesCount());
          }
          if (parsedMessage.event == EVENTS.DECODE_IMAGES) {
            if (!parsedMessage.password) {
              return sendError("No password provided");
            }
            return decodeImages(parsedMessage.password, (data) =>
              sendResponse(EVENTS.DECODE_IMAGES, data)
            );
          }
          return sendError("Invalid Event");
        } catch (error) {
          console.log(error);
          sendError(error.message);
        }
      });
    }
  );

  return websocketServer;
};
