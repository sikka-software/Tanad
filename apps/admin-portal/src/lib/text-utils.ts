export const convertToTranslationKey = (text: string) => {
  const converted = text.toLowerCase().split(" ").join("_");
  return converted;
};
