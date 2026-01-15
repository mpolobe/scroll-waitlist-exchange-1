export const isAlchemyConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  return !!(apiKey && apiKey !== 'demo');
};