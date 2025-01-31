export const fetchChannelMessages = async (
  client,
  channelEntity,
): Promise<string[]> => {
  let messages = await client.getMessages(channelEntity, {
    limit: undefined,
    waitTime: 10,
    search: "Communist",
  });

  return messages;
};
