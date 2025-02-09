import { db } from "../../index";
import { sql, eq } from "drizzle-orm";

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
