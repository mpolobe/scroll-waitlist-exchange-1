const App = () => {
  const { isAlchemyConfigured, alchemyConfig } = useContext(SomeContext); // assuming context provides isAlchemyConfigured and alchemyConfig

  const AlchemyAccountProvider = isAlchemyConfigured && alchemyConfig
    ? require('@account-kit/react').AlchemyAccountProvider
    : null;

  return (
    <appTree>
      {/* other components */}
      {AlchemyAccountProvider ? (
        <AlchemyAccountProvider config={alchemyConfig}>
          {/* children wrapped with AlchemyAccountProvider */}
        </AlchemyAccountProvider>
      ) : (
        {/* children without provider */}
      )}
    </appTree>
  );
};

export default App;