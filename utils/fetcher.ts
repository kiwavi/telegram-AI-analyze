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
import {
  fetchAllQuestions,
  fetchQuestion,
  saveQuestion,
} from "../src/db/models/questions";
import promptSync from "prompt-sync";
import { Dialog } from "telegram/tl/custom/dialog";
import { InputLocations } from "./openai";
import { fetchChannel } from "../src/db/models/channels";

const prompt = promptSync();

dotenv.config();

let apiId = process.env.API_ID;
const apiHash = process.env.API_HASH as string;

// Use the Methods Methods
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function startInteraction(
  r1: readline.Interface
): Promise<TelegramClient> {
  const client = new TelegramClient(
    new StringSession(""),
    Number(apiId),
    apiHash,
    {}
  );

  await client.start({
    phoneNumber: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your number: ", resolve)
      ),
    password: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your password: ", resolve)
      ),
    phoneCode: async () =>
      new Promise((resolve) =>
        rl.question("Please enter the code you received: ", resolve)
      ),
    onError: (err) => console.log(err),
  });

  return client;
}

async function getClientChannels(client: TelegramClient): Promise<Dialog[]> {
  // returns current channels
  let dialogs = await client.getDialogs({});
  let channels: Dialog[] = [];
  const getChannels = async () => {
    channels = dialogs.filter((nm) => nm.isChannel);
  };
  return channels;
}

async function compareCurrentAndSavedChannels(client: TelegramClient) {
  // this should only handle saving channels in db and returning them. Return channelsArr
  // current channels

  let channelsArr: {
    name: string;
    value: bigint | null;
    description: string;
  }[] = [];

  let channels = await getClientChannels(client);
  // saved channels
  let all_channels = await allChannels();

  if (!all_channels?.length) {
    // if no channels in db
    console.log("There are no saved channels");
    console.log(channels);
    if (channels?.length) {
      console.log("Saving channels");
      await saveChannels(channels);
      all_channels = await allChannels();
      for (let chn of all_channels) {
        console.log(chn);
        let obj: { name: string; value: bigint | null; description: string } = {
          name: chn.channel_name,
          value: chn.telegram_channel_id,
          description: chn.channel_name,
        };

        channelsArr.push(obj);
      }
    } else {
      console.log(
        "You are not subscribed to any channels. Please subscribe first"
      );
      throw new Error("You are not subscribed to any channels.");
    }
  } else {
    // they have channels in db. confirm whether some are not in db and inform user
    let arr: object[] = [];
    for (let channel of channels) {
      let obj: {
        telegram_channel_id: number | undefined;
        channel_name: string | undefined;
      } = {
        telegram_channel_id: channel?.id?.toJSNumber(),
        channel_name: channel.title,
      };
      arr.push(obj);
    }

    let compared = await compareChannels(arr);

    if (compared?.rows?.length) {
      console.log(
        "Some of the subscribed channels have not been saved to the database. Do you want to add them?"
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

      all_channels = await allChannels();

      for (let chn of all_channels) {
        let obj: { name: string; value: bigint | null; description: string } = {
          name: chn.channel_name,
          value: chn.telegram_channel_id,
          description: chn.channel_name,
        };

        channelsArr.push(obj);
      }
    } else {
      for (let chn of all_channels) {
        let obj: { name: string; value: bigint | null; description: string } = {
          name: chn.channel_name,
          value: chn.telegram_channel_id,
          description: chn.channel_name,
        };
        channelsArr.push(obj);
      }
    }
  }

  return channelsArr;
}

async function fetchAction(): Promise<number> {
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
  return answer;
}

async function actOnChoice(
  answer: number,
  channelsArr: {
    name: string;
    value: bigint | null;
    description: string;
  }[] = [],
  client: TelegramClient
) {
  if (Object.is(answer, 1)) {
    const channelsToQuery: bigint | null = await select({
      message: "Which channel do you want to fetch data from?",
      choices: channelsArr,
    });

    console.log("You have successfully chosen a channel");

    if (!channelsToQuery) {
      throw new Error("You must choose a channel in order to continue");
    }

    let dialogs = await client.getDialogs({});

    let extractDialogEntity = dialogs.find(
      (nm) => Number(nm.id) == Number(channelsToQuery)
    )?.entity;

    let messages = await fetchChannelMessages(client, extractDialogEntity);

    // console.log(JSON.stringify(messages));

    let all_channels = await allChannels();

    let channelId: number = all_channels.find(
      (nm) => Number(nm.telegram_channel_id) == Number(channelsToQuery)
    )?.id as number;

    console.log(messages.length);

    let chunks = _.chunk(messages, 5000);

    for (let chn of chunks) {
      let savedMessages = await saveMessages(JSON.stringify(chn), channelId);
    }
    // convert the messages into chunks

    console.log("Messages saved successfully");
  } else if (Object.is(answer, 2)) {
    // chose to query AI regarding a specific question
    let savedQuestion: {
      id: number;
      created_at: Date;
      updated_at: Date;
      deleted_at: Date | null;
      question: string;
    }[];

    let questions: {
      id: number;
      created_at: Date;
      updated_at: Date;
      deleted_at: Date | null;
      question: string;
    }[] = await fetchAllQuestions();
    if (!questions?.length) {
      // have them add a question
      console.log("You do not have any questions yet");
      const question = prompt("What is your question?");

      savedQuestion = await saveQuestion(question);
    } else {
      let answer = await select({
        message: "Which action do you want to do?",
        choices: [
          {
            name: "Ask new question",
            value: 1,
            description: "New",
          },
          {
            name: "Ask existing question",
            value: 2,
            description: "Existing",
          },
        ],
        default: "Ask existing question",
      });

      if (Object.is(answer, 1)) {
        const question = prompt("What is your question?");
        savedQuestion = await saveQuestion(question);
      } else {
        let choices: {
          name: string;
          value: number;
          description: string;
        }[] = [];
        for (let q of questions) {
          choices.push({
            name: q.question,
            value: q.id,
            description: q.question,
          });
        }
        const answer = await select({
          message: "Which action do you want to do?",
          choices,
          default: choices[0].value,
        });
        // fetch the chosen question from db
        savedQuestion = await fetchQuestion(answer);
        console.log(savedQuestion);
      }
    }

    // now we apply the question to a channel
    let channelsToQuery: bigint | null = await select({
      message: "Which channel do you want to query AI about ?",
      choices: channelsArr,
    });

    const channelName = channelsArr.find(
      (element) => element.value == channelsToQuery
    )?.name;

    const channelId = channelsArr.find(
      (element) => element.value == channelsToQuery
    )?.value;

    let channelIdId = await fetchChannel(channelId);

    if (channelsToQuery) {
      console.log(savedQuestion);
      console.log(
        `You are about to ask ${savedQuestion[0].question} of all messages in ${channelName}`
      );
    }

    const askAIAnswer = await select({
      message: "Proceed?",
      choices: [
        {
          name: "Yes",
          value: 1,
          description: "Yes",
        },
        {
          name: "No",
          value: 2,
          description: "No",
        },
      ],
      default: "Ask existing question",
    });

    if (Object.is(askAIAnswer, 1)) {
      console.log("Creating and sending batches to chatgpt Batch API");
      // call the function that sends the query to AI
      try {
        await InputLocations(Number(channelIdId[0]?.id), savedQuestion);
      } catch (e) {
        console.log(e);
      }
    } else {
      // exit program
    }
  }
}
