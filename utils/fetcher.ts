import dotenv from "dotenv";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";
import {
  allChannels,
  compareChannels,
  saveChannels,
} from "../src/db/models/channels";

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

const getChannels = async (): Promise<string[]> => {
  const dialogs = await client.getDialogs({});
  let channels = dialogs.filter((nm) => nm.isChannel);
  return channels;
};

let channels = await getChannels();

if (!allChannels?.length) {
  // if no channels in db
  console.log("There are no saved channels");
  console.log(channels);
  if (channels?.length) {
    console.log("Saving channels");
    let res = await saveChannels(channels);
    console.log(res);
  } else {
    console.log(
      "You are not subscribed to any channels. Please subscribe first",
    );
    throw new Error("You are not subscribed to any channels.");
  }
} else {
  // they have channels in db. confirm whether some are not in db and inform user
  let arr = [];
  for (let channel of channels) {
    let obj = {};
    obj.telegram_channel_id = Number(channel.id.value);
    obj.channel_name = channel.title;
    arr.push(obj);
  }

  let compared = await compareChannels(arr);
  if (compared?.length) {
    console.log(
      "Some of the subscribed channels have not been saved to the database. Do you want to add them?",
    );
    // if yes then invoke saveChannels on the missing entries. Else continue
  }

  // choose a channel from which they want to fetch messages from and populate the database. Of course check whether channel is saved in db.
}

// we now need to compare the channels they have with the ones in database. But first we need to fetch from database

// fetch those channels.

// const dialogs = await client.getDialogs({});

// let rt_dialo_id = dialogs.find((nm) => nm.name === "RT News")?.entity;

// let messages = await client.getMessages(rt_dialo_id, {
//   limit: undefined,
//   waitTime: 10,
// });

// let filteredMessages = [];

// for (let msg of messages) {
//   if (new Date(msg.date * 1000) > new Date("2023-10-07T00:29:02.000Z")) {
//     filteredMessages.push(msg);
//   }
// }

// The channel, searchString should preferably be dynamic
