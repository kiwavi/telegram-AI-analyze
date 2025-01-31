export const fetchChannelMessages = async (
  client,
  channelEntity,
): Promise<string[]> => {
  let messages = await client.getMessages(channelEntity, {
    limit: 1,
    waitTime: 10,
    search: "Communist",
  });

  return messages;
};
