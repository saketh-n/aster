export const wait = async (millis: number) => {
  await new Promise(resolve => setTimeout(resolve, millis))
}