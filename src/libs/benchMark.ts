export const benchMarkFunction = async (func: () => Promise<void>) => {
  const startTime = Date.now();
  await func();
  const endtime = Date.now();
  const diff = endtime - startTime;
  console.log(`Duration: ${diff / 1000} sec`);
};
