import { TelegramClient } from "telegram";

export const fetchChannelMessages = async (
  client: TelegramClient,
  channelEntity: any,
) => {
  let messages = await client.getMessages(channelEntity, {
    limit: undefined,
    waitTime: 10,
    // search: "Communist",
  });

  return messages;
};
