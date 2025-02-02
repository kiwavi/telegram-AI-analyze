import dotenv from "dotenv";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";
import {
  allChannels,
  compareChannels,
  saveChannels,
} from "../src/db/models/channels";
import { select, Separator } from "@inquirer/prompts";
import { fetchChannelMessages } from "./fetchMessages";
import { saveMessages } from "../src/db/models/messages";
import _ from "lodash";
import { fetchAllQuestions, saveQuestion } from "../src/db/models/questions";
import promptSync from "prompt-sync";

const prompt = promptSync();

dotenv.config();

let apiId = process.env.API_ID;
const apiHash: string = process.env.API_HASH;

// Use the Methods Methods
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new TelegramClient(
  new StringSession(""),
  Number(apiId),
  apiHash,
  {},
);

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

let dialogs = await client.getDialogs({});

const getChannels = async (): Promise<string[]> => {
  let channels = dialogs.filter((nm) => nm.isChannel);
  return channels;
};

let channels = await getChannels();
let channelsArr: { name: string; value: bigint; description: string }[] = [];
let all_channels = await allChannels();

// this should only handle saving channels in db and returning them. Return channelsArr
if (!all_channels?.length) {
  // if no channels in db
  console.log("There are no saved channels");
  console.log(channels);
  if (channels?.length) {
    console.log("Saving channels");
    let res = await saveChannels(channels);
    let refetchChannels = await allChannels();
    for (let chn of refetchChannels) {
      console.log(chn);
      let obj: { name: string; value: bigint; description: string } = {};
      obj.name = chn.channel_name;
      obj.value = chn.telegram_channel_id;
      obj.description = chn.channel_name;
      channelsArr.push(obj);
    }
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
    let obj: { telegram_channel_id: bigint; channel_name: string } = {};
    obj.telegram_channel_id = Number(channel.id.value);
    obj.channel_name = channel.title;
    arr.push(obj);
  }

  let compared = await compareChannels(arr);
  console.log(compared);
  if (compared?.rows?.length) {
    console.log(
      "Some of the subscribed channels have not been saved to the database. Do you want to add them?",
    );
    const answer = await select({
      message: "Do you want to save these channels",
      choices: [
        {
          name: "Yes",
          value: 1,
          description: "Positive",
        },
        {
          name: "No",
          value: 0,
          description: "Negative",
        },
      ],
      default: "Yes",
    });

    if (answer) {
      console.log("saving channels");
      let channelsToSave = compared.rows;
      await saveChannels(channelsToSave);
    }

    let refetchChannels = await allChannels();

    for (let chn of refetchChannels) {
      let obj: { name: string; value: number; description: string } = {};
      obj.name = chn.channel_name;
      obj.value = chn.telegram_channel_id;
      obj.description = chn.channel_name;
      channelsArr.push(obj);
    }
  } else {
    for (let chn of all_channels) {
      let obj: { name: string; value: number; description: string } = {};
      obj.name = chn.channel_name;
      obj.value = chn.telegram_channel_id;
      obj.description = chn.channel_name;
      channelsArr.push(obj);
    }
  }
}

// at this point they have channels and can either fetch data from channels or ask questions based on messages.
const answer = await select({
  message: "Which action do you want to do?",
  choices: [
    {
      name: "Fetch data from channels",
      value: 1,
      description: "Fetch data",
    },
    {
      name: "Query AI about the contents of a specific channel",
      value: 2,
      description: "Query AI",
    },
  ],
  default: "Fetch data from channels",
});

if (Object.is(answer, 1)) {
  const channelsToQuery: bigint = await select({
    message: "Which channel do you want to fetch data from?",
    choices: channelsArr,
    default: channelsArr[0].name,
  });

  console.log("You have successfully chosen a channel");

  if (!channelsToQuery) {
    throw new Error("You must choose a channel in order to continue");
  }

  console.log(channelsToQuery);

  let extractDialogEntity = dialogs.find(
    (nm) => Number(nm.id) == Number(channelsToQuery),
  )?.entity;

  let messages = await fetchChannelMessages(client, extractDialogEntity);

  // console.log(JSON.stringify(messages));

  let channelsRefetch = await allChannels();

  let channelId: number = channelsRefetch.find(
    (nm) => Number(nm.telegram_channel_id) == Number(channelsToQuery),
  )?.id;

  console.log(messages.length);

  let chunks = _.chunk(messages, 5000);

  for (let chn of chunks) {
    let savedMessages = await saveMessages(JSON.stringify(chn), channelId);
  }
  // convert the messages into chunks

  console.log("Messages saved successfully");
}

if (Object.is(answer, 2)) {
  // fetch existing questions and display them. If none then tell them to add a question
  let questions = await fetchAllQuestions();
  if (!questions?.length) {
    // have them add a question
    console.log("You do not have any questions yet");
    const question = prompt("What is your question?");

    let savedQuestion = await saveQuestion(question);

    console.log(savedQuestion);
  } else {
    // let them choose from existing questions or add a new question.
  }
}
