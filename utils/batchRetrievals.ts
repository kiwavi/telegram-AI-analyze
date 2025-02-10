import {
  getCompletedBatches,
  updateBatchAsSaved,
} from "../src/db/models/batches";
import { getBatchResults, getBatchStatus } from "./openai";
import fs from "fs";
import { readFileSync } from "fs";
import readline from "readline";
import { saveAnswersBatch } from "../src/db/models/answers";

export const retrieveBatchResults = async () => {
  let batches = await getCompletedBatches();
  for (let batch of batches) {
    await saveAnswers(batch);
  }
};

export const saveAnswers = async (batch: {
  id: number;
  created_at: Date;
  updated_at: string;
  deleted_at: Date | null;
  channel_id: bigint;
  question_id: number;
  batchid: string;
  status: string;
  fileid: string;
  outputfileid: string | null;
}) => {
  let path = await getBatchResults(batch.outputfileid as string);
  console.log(path);
  // returns the path where the file has been saved. Use the path to read file and insert content

  // create a readline interface for reading the file line by line
  const rl = readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity,
  });

  // create an array to hold the parsed JSON objects
  let jsonArray = [];

  // read each line of the file and parse it as JSON
  rl.on("line", (line) => {
    // jsonArray.push(JSON.parse(line));
    let datainst = JSON.parse(line);
    if (datainst.error == null) {
      let obj = {};
      obj.question_id = batch.question_id;
      obj.answer = datainst.response.body.choices[0].message.content;
      obj.message_id = Number(datainst.custom_id);
      jsonArray.push(obj);
    }
  });

  // log the parsed JSON objects once the file has been fully read
  rl.on("close", () => {
    console.log(jsonArray);
    saveAnswersBatch(jsonArray);
    updateBatchAsSaved(batch.batchid);
  });
};

await retrieveBatchResults();
