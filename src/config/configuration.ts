export const parseEnvironment = () => {
  return {
    port: parseInt(process.env.PORT),
  };
};
