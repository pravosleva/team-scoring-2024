export const getBytesFromMiB = (mebibytes: number): number => {
  // 1 MiB = 1024 * 1024 Bytes
  const bytesPerMebibyte = 1024 * 1024;
  const bytes = mebibytes * bytesPerMebibyte;
  return bytes;
};
