const generateRandomString = (symbols: string, length: number) => {
  let outcome = '';
  for (let i = 0; i < length; i++)
    outcome += symbols[Math.floor(Math.random() * symbols.length)];
  return outcome;
};
export default generateRandomString;
