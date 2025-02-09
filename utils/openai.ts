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

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {
      role: "user",
      content: `Does the sentence 'An Israeli drone drops a bomb on a building in northern Gaza, flies off, and detonates it near Palestinian civilians, footage shared by local media shows' revolve around the Israel-Palestine conflict? Answer with yes or no or maybe.`,
    },
    {
      role: "user",
      content: `Does the sentence 'An Israeli drone drops a bomb on a building in northern Gaza, flies off, and detonates it near Palestinian civilians, footage shared by local media shows' revolve around the Israel-Palestine conflict? Answer with yes or no or maybe.`,
    },
  ],
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
  let locs = [];
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
          max_tokens: 1000,
        },
      };
      writeStream.write(`${JSON.stringify(entry)}\n`);
    }
    writeStream.end();
    locs.push(writeStream.path);
  }

  console.log(locs);
  let batchesToInput = [];

  for (let loc of locs) {
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

  console.log(batchesToInput);

  await saveBatches(batchesToInput);

  return locs;
};

completion.then((result) => console.log(result.choices[0].message));

await InputLocations(45, [
  {
    id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: new Date(),
    question:
      "Is the message below within the context of the Israel-Palestine conflict? Please answer using yes or no",
  },
]);
