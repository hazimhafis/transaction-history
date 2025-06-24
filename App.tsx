import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from '@tamagui/core';
import tamaguiConfig from './tamagui.config';
import { Transaction } from './types/transaction';
import { LoginScreen } from './screens/LoginScreen';
import { TransactionHistoryScreen } from './screens/TransactionHistoryScreen';
import { TransactionDetailScreen } from './screens/TransactionDetailScreen';
import { AuthProvider } from './hooks/AuthContext';

type Screen = 'login' | 'history' | 'detail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleLoginSuccess = () => {
    setCurrentScreen('history');
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setCurrentScreen('detail');
  };

  const handleBackToHistory = () => {
    setSelectedTransaction(null);
    setCurrentScreen('history');
  };

  const handleLogout = () => {
    setSelectedTransaction(null);
    setCurrentScreen('login');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      
      case 'history':
        return (
          <AuthProvider onLogout={handleLogout}>
            <TransactionHistoryScreen
              onTransactionPress={handleTransactionPress}
              onLogout={handleLogout}
            />
          </AuthProvider>
        );
      
      case 'detail':
        return selectedTransaction ? (
          <AuthProvider onLogout={handleLogout}>
            <TransactionDetailScreen
              transaction={selectedTransaction}
              onBack={handleBackToHistory}
            />
          </AuthProvider>
        ) : null;
      
      default:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <TamaguiProvider config={tamaguiConfig}>
      {renderCurrentScreen()}
      <StatusBar style="auto" />
    </TamaguiProvider>
  );
}
