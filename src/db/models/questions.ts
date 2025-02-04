import { db } from "../../index";
import { questions } from "../schema";
import { eq } from "drizzle-orm";

export const fetchAllQuestions = async (): Promise<String[]> => {
  let res;
  res = await db.select().from(questions);
  return res;
};

export const saveQuestion = async (ques: string) => {
  let res;
  res = await db.insert(questions).values({ question: ques }).returning();
  return res;
};

export const fetchQuestion = async (id: number): Promise<String[]> => {
  let res;
  res = await db.select().from(questions).where(eq(questions.id, id));
  return res;
};
