import { db } from "../../index";
import { sql, eq } from "drizzle-orm";
import { batches } from "../../db/schema";

export const saveBatches = async (batches: object[]) => {
  let res = await db.execute(
    sql`WITH init_table(fileid, batchid, status, question_id, channel_id) AS
      (SELECT *
       FROM jsonb_to_recordset(${JSON.stringify(
         batches
       )}::jsonb) AS x(fileid text, batchid text, status text, question_id int, channel_id int))
    INSERT INTO batches("fileid", "batchid", "status", "question_id", "channel_id")
      (SELECT *
       FROM init_table)`
  );
  return res;
};

export const getValidatingBatches = async () => {
  let batch = await db
    .select()
    .from(batches)
    .where(eq(batches.status, "validating"));
  return batch;
};

export const updateBatchStatus = async (batchid: string, status: string) => {
  let res = await db
    .update(batches)
    .set({ status })
    .where(eq(batches.batchid, batchid));
  return res;
};

export const updateOutputFileId = async (batchid: string, fileid: string) => {
  let res = await db
    .update(batches)
    .set({ outputfileid: fileid })
    .where(eq(batches.batchid, batchid));
  return res;
};

export const getCompletedBatches = async () => {
  let batch = await db
    .select()
    .from(batches)
    .where(eq(batches.status, "completed"));
  return batch;
};
