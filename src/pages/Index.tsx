import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { SmartWalletProvider } from '@/contexts/SmartWalletContext';

const Index: React.FC = () => {
  return (
    <SmartWalletProvider>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </SmartWalletProvider>
  );
};

export default Index;
