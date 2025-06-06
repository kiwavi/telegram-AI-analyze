// all crud operations to deal with channels
import { Dialog } from "telegram/tl/custom/dialog";
import { db } from "../../index";
import { channels } from "../schema";
import { sql, eq } from "drizzle-orm";

export const allChannels = async () => {
  let res;
  res = await db.select().from(channels);
  return res;
};

export const saveChannels = async (tel_channels: Dialog[]) => {
  // take in a list of channels and iterate through them while saving them
  let arr = [];
  let res;
  for (let channel of tel_channels) {
    let obj: { telegram_channel_id: bigint; channel_name: string } = {
      telegram_channel_id: channel?.id?.value || channel.telegram_channel_id,
      channel_name: channel?.title || channel.channel_name,
    };
    arr.push(obj);
  }
  if (arr.length) {
    res = await db
      .insert(channels)
      .values(arr)
      .returning({ insertedId: channels.id });
    return res;
  } else {
    throw new Error("No rows to insert");
  }
};

export const compareChannels = async (tel_channels: object[]) => {
  if (tel_channels?.length) {
    let query =
      await db.execute(sql`WITH temp_table(telegram_channel_id, channel_name) AS
      (SELECT *
       FROM jsonb_to_recordset(${JSON.stringify(
         tel_channels
       )}) AS x(telegram_channel_id bigint, channel_name varchar(255))),
         current_table(telegram_channel_id, channel_name) AS
      (SELECT telegram_channel_id,
              channel_name
       FROM channels)
    SELECT *
    FROM temp_table
    EXCEPT
    SELECT *
    FROM current_table`);
    return query;
  } else {
    throw new Error("No rows to compare");
  }
};

export const fetchChannel = async (channelId: bigint) => {
  let res;
  res = await db
    .select()
    .from(channels)
    .where(eq(channels.telegram_channel_id, channelId));
  return res;
};
