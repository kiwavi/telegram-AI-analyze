import OpenAI from "openai";
import dotenv from "dotenv";
import { fetchChannelMessages } from "../src/db/models/messages";
import _ from "lodash";
import fs from "fs";
import { uuidv7 } from "uuidv7";
import { saveBatches } from "../src/db/models/batches";

dotenv.config();

let apiSecret = process.env.OPENAI_SECRET;

const openai = new OpenAI({
  apiKey: apiSecret,
});

export const createBatchFile = async (channel: number) => {
  // with channel we can get all messages linked to it, with question we can get the question id
  let messages = await fetchChannelMessages(channel);
  let chunks = _.chunk(messages, 30000);
  return chunks;
};

export const InputLocations = async (
  channel: number,
  question: {
    id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    question: string;
  }[]
) => {
  let chunks = await createBatchFile(channel);
  let locs: string[] = [];
  for (let chunk of chunks) {
    // create a jsonl file
    var writeStream = fs.createWriteStream(
      `./${channel}_${question[0].id}_${uuidv7()}.jsonl`
    );
    for (let chn of chunk) {
      let entry = {
        custom_id: `${chn.id}`,
        method: "POST",
        url: "/v1/chat/completions",
        body: {
          model: "gpt-3.5-turbo-0125",
          messages: [
            {
              role: "user",
              content: `${question[0].question}: ${chn.message}`,
            },
          ],
          max_tokens: 10,
        },
      };
      writeStream.write(`${JSON.stringify(entry)}\n`);
    }
    writeStream.end();
    locs.push(writeStream.path);
  }

  let batchesToInput = [];

  for (let loc of locs) {
    async function waitForFileExists(loc, currentTime = 0, timeout = 5000) {
      if (fs.existsSync(loc)) return true;
      if (currentTime === timeout) return false;
      // wait for 1 second
      await new Promise((resolve, reject) =>
        setTimeout(() => resolve(true), 1000)
      );
      // waited for 1 second
      return waitForFileExists(loc, currentTime + 1000, timeout);
    }

    await waitForFileExists(loc);

    // upload the input file
    const file = await openai.files.create({
      file: fs.createReadStream(locs[0]),
      purpose: "batch",
    });

    const batch = await openai.batches.create({
      input_file_id: file.id,
      endpoint: "/v1/chat/completions",
      completion_window: "24h",
    });

    let batchToAdd = {
      fileid: file.id,
      batchid: batch.id,
      status: batch.status,
      question_id: question[0].id,
      channel_id: channel,
    };

    batchesToInput.push(batchToAdd);
  }

  await saveBatches(batchesToInput);

  return locs;
};

export const getBatchStatus = async (batch_id: string) => {
  const batch = await openai.batches.retrieve(batch_id);
  // console.log(batch);
  return batch;
};

export const getBatchResults = async (outputfileid: string) => {
  // returns the path to the file where the contents have been saved
  const fileResponse = await openai.files.content(outputfileid);
  const fileContents = await fileResponse.text();

  console.log(fileContents);

  var writeStream = fs.createWriteStream(`./${outputfileid}_${uuidv7()}.jsonl`);
  writeStream.write(fileContents);
  writeStream.end();

  async function waitForFileExists(loc, currentTime = 0, timeout = 5000) {
    if (fs.existsSync(loc)) return true;
    if (currentTime === timeout) return false;
    // wait for 1 second
    await new Promise((resolve, reject) =>
      setTimeout(() => resolve(true), 1000)
    );
    // waited for 1 second
    return waitForFileExists(loc, currentTime + 1000, timeout);
  }

  await waitForFileExists(writeStream.path);

  return writeStream.path;
};
