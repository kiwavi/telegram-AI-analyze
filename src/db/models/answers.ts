import { db } from "../../index";
import { sql, eq } from "drizzle-orm";
import { answers } from "../schema";

export const saveAnswersBatch = async (
  batch_answers: {
    question_id: number;
    answer: string;
    message_id: number;
  }[]
) => {
  let answersinsert = await db
    .insert(answers)
    .values(batch_answers)
    .onConflictDoNothing();
};
