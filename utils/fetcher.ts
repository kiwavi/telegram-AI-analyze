import dotenv from "dotenv";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";

dotenv.config();

let apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;

// Use the Methods Methods
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {});

await client.start({
  phoneNumber: async () =>
    new Promise((resolve) =>
      rl.question("Please enter your number: ", resolve),
    ),
  password: async () =>
    new Promise((resolve) =>
      rl.question("Please enter your password: ", resolve),
    ),
  phoneCode: async () =>
    new Promise((resolve) =>
      rl.question("Please enter the code you received: ", resolve),
    ),
  onError: (err) => console.log(err),
});
console.log("You should now be connected.");

const dialogs = await client.getDialogs({});

let rt_dialo_id = dialogs.find((nm) => nm.name === "RT News")?.entity;

let messages = await client.getMessages(rt_dialo_id, {
  limit: undefined,
  waitTime: 10,
  // search: "Communist",
});

let filteredMessages = messages.map((msg) => {
  new Date(msg.date * 1000) > new Date("2023-10-07T00:29:02.000Z");
});

console.log(messages.length);

// The channel, searchString should preferably be dynamic
