/**
 * Takes a message string and encodes it as an array of bigints.
 * @param message The message to be hashed.
 * @returns The message encoded as array of bigints.
 */
export function stringToFields(message: string): bigint[] {
  // the message string can have arbitrary length
  // but the circuit can only accept 32 Byte Fields encoded as 64 char hex strings
  // which is why we have to serialise the message like this
  const splitMessage = message.match(/.{1,31}/g);
  if (splitMessage == null) return [];

  return splitMessage.map((m) => {
    const hex = Buffer.from(m).toString("hex");
    return BigInt(`0x${hex}`);
  });
}
