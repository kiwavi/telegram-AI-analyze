import OpenAI from "openai";
import dotenv from "dotenv";
import { fetchChannelMessages } from "../src/db/models/messages";
import _ from "lodash";
import fs from "fs";
import { uuidv7 } from "uuidv7";

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

export const createBatchFile = async (
  channel: number,
  question: {
    id: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    question: string;
  }[]
) => {
  // with channel we can get all messages linked to it, with question we can get the question id
  let messages = await fetchChannelMessages(channel);
  let chunks = _.chunk(messages, 30000);
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
  }
};

completion.then((result) => console.log(result.choices[0].message));

createBatchFile(45, [
  {
    id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: new Date(),
    question:
      "Is the message beolow within the context of the Israel-Palestine conflict? Please answer using yes or no",
  },
]);
