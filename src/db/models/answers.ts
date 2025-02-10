import { db } from "../../index";
import { sql, eq } from "drizzle-orm";
import { answers } from "../schema";

export const saveAnswersBatch = async (batch_answers: object[]) => {
  let answersinsert = await db
    .insert(answers)
    .values(batch_answers)
    .onConflictDoNothing();
};
