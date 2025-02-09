// all crud operations to deal with channels
import { Dialog } from "telegram/tl/custom/dialog";
import { db } from "../../index";
import { channels } from "../schema";
import { sql } from "drizzle-orm";

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
       FROM jsonb_to_recordset(${JSON.stringify(tel_channels)}) AS x(telegram_channel_id bigint, channel_name varchar(255))),
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

// await saveChannels([
//   {
//     telegram_channel_id: -1002098116995,
//     channel_name: "🇰🇪 The Kenya We Want 🇰🇪",
//   },
//   {
//     telegram_channel_id: -1001090406917,
//     channel_name: "Nairobi GNU/Linux User Group",
//   },
//   { telegram_channel_id: -1001387645188, channel_name: "RT News" },
//   { telegram_channel_id: -1001321385690, channel_name: "Al Jazeera English" },
//   { telegram_channel_id: -1001222973093, channel_name: "National Geographic" },
//   { telegram_channel_id: -1002111495264, channel_name: "ZYNERIS.COM" },
//   { telegram_channel_id: -1001942691032, channel_name: "African Stream" },
//   {
//     telegram_channel_id: -1001197600239,
//     channel_name: "React Developer Community Kenya",
//   },
//   {
//     telegram_channel_id: -1001836620031,
//     channel_name: "UNIswap-MEV節點礦池官方中文群",
//   },
//   { telegram_channel_id: -1001411818369, channel_name: "Dr Mumbi Show" },
// ]);
