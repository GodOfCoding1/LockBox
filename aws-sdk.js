import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchGetCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const postImage = async (imageData) => {
  const command = new PutCommand({
    TableName: "corrupted-images",
    Item: imageData,
  });
  const res = await docClient.send(command);
  return res;
};

export const getAllImages = async (imageData) => {
  const command = new PutCommand({
    TableName: "corrupted-images",
    Item: imageData,
  });
  const res = await docClient.send(command);
  return res;
};

export const main = async () => {
  const command = new BatchGetCommand({
    RequestItems: {
      "corrupted-images": {
        Keys: [{}],
      },
    },
  });

  const response = await docClient.send(command);
  console.log(response.Responses["Books"]);
  return response;
};
main();

// {
//   asset_id: "1",
//   time: Date.now().toString(),
//   url: "https://res.cloudinary.com/hibyehibye/raw/upload/v1704790475/corrupted-images/gqsw3y1ig8rdfxerhjsk",
//   hash: "gqsw3y1ig8rdfxerhjsk",
// }
