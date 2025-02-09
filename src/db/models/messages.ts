import { db } from "../../index";
import { sql, eq } from "drizzle-orm";
import { messages } from "../schema";

export const saveMessages = async (messages: string, channel_id: number) => {
  let res;
  res =
    await db.execute(sql`explain analyze WITH temp_table(message, telegram_message_id, channel_id, telegram_created_at) AS
    (SELECT message,
            id,
            ${channel_id}::bigint,
            to_timestamp("date")::date
     FROM jsonb_to_recordset(${messages}) AS x(message text,telegram_message_id bigint,channel_id bigint,telegram_created_at date, id bigint, "peerId" JSONB, date int))
  INSERT INTO messages(message, telegram_message_id, channel_id, telegram_created_at)
    (SELECT *
     FROM temp_table where message is not null and message != '') ON CONFLICT DO NOTHING;`);
  console.log(res);
  return res;
};

export const fetchChannelMessages = async (channelId: number) => {
  let res;
  res = await db
    .select()
    .from(messages)
    .where(eq(messages.channel_id, channelId));
  return res;
};
