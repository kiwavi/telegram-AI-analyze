// all crud operations to deal with channels
import { db } from "../../index";
import { channels } from "../schema";

export const allChannels = await db.select().from(channels);

export const saveChannels = async (tel_channels: string[]) => {
  // take in a list of channels and iterate through them while saving them
  let arr = [];
  let res;
  for (let channel of tel_channels) {
    let obj = {};
    obj.telegram_channel_id = channel.id.value;
    obj.channel_name = channel.title;
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
