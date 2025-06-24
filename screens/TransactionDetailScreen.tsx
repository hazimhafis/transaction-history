import React, { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { ArrowLeft, Eye, EyeOff } from '@tamagui/lucide-icons';
import { Transaction } from '../types/transaction';
import { AuthService } from '../services/authService';
import { TransactionService } from '../services/transactionService';
import { useAuth } from '../hooks/AuthContext';

interface TransactionDetailScreenProps {
  transaction: Transaction;
  onBack: () => void;
}

export const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({
  transaction,
  onBack,
}) => {
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const authService = AuthService.getInstance();
  const transactionService = TransactionService.getInstance();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      onBack();
    }
  }, [isAuthenticated, onBack]);

  const handleToggleSensitiveData = async () => {
    if (showSensitiveData) {
      setShowSensitiveData(false);
      return;
    }

    setIsAuthenticating(true);
    try {
      const success = await authService.authenticateWithBiometrics();
      if (success) {
        setShowSensitiveData(true);
      }
    } catch (error: any) {
      Alert.alert(
        'Authentication Failed',
        error.message || 'Failed to authenticate',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (!showSensitiveData) {
      return '****';
    }
    
    const formatted = transactionService.formatAmount(amount);
    return transaction.type === 'debit' ? `-${formatted}` : `+${formatted}`;
  };

  const getAmountColor = () => {
    if (!showSensitiveData) {
      return '$color';
    }
    return transaction.type === 'debit' ? '$red10' : '$green10';
  };

  const formatBalance = (balance?: number) => {
    if (!showSensitiveData || !balance) {
      return '****';
    }
    
    return transactionService.formatAmount(balance);
  };

  const DetailRow = ({ label, value, sensitive = false }: { label: string; value: string; sensitive?: boolean }) => (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2">
      <Text fontSize="$4" color="$colorSubtle" flex={1}>
        {label}
      </Text>
      <Text 
        fontSize="$4" 
        fontWeight="500" 
        color={sensitive && !showSensitiveData ? '$colorSubtle' : '$color'}
        flex={2}
        textAlign="right"
      >
        {sensitive && !showSensitiveData ? '****' : value}
      </Text>
    </XStack>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack 
          padding="$4" 
          alignItems="center" 
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <XStack alignItems="center" gap="$3">
            <Button
              size="$3"
              chromeless
              icon={ArrowLeft}
              onPress={onBack}
            />
            <Text fontSize="$6" fontWeight="700" color="$color">
              Transaction Details
            </Text>
          </XStack>
          
          <Button
            size="$6"
            chromeless
            icon={showSensitiveData ? EyeOff : Eye}
            onPress={handleToggleSensitiveData}
            disabled={isAuthenticating}
            opacity={isAuthenticating ? 0.5 : 1}
          />
        </XStack>

        <ScrollView style={{ flex: 1 }}>
          <YStack padding="$4" gap="$4">
            {/* Main Transaction Card */}
            <Card elevate size="$4" bordered backgroundColor="$background">
              <Card.Header>
                <YStack gap="$3" alignItems="center">
                  {/* Transaction Icon */}
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={30}
                    backgroundColor="$backgroundHover"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="$8">
                      {transactionService.getTransactionIcon(transaction.category)}
                    </Text>
                  </YStack>

                  {/* Amount */}
                  <Text
                    fontSize="$8"
                    fontWeight="700"
                    color={getAmountColor()}
                    textAlign="center"
                  >
                    {formatAmount(transaction.amount)}
                  </Text>

                  {/* Description */}
                  <Text
                    fontSize="$5"
                    fontWeight="600"
                    color="$color"
                    textAlign="center"
                  >
                    {transaction.description}
                  </Text>

                  {/* Date */}
                  <Text
                    fontSize="$3"
                    color="$colorSubtle"
                    textAlign="center"
                  >
                    {transactionService.formatDate(transaction.date)}
                  </Text>
                </YStack>
              </Card.Header>
            </Card>

            {/* Transaction Details */}
            <Card elevate size="$4" bordered backgroundColor="$background">
              <Card.Header>
                <YStack gap="$2">
                  <Text fontSize="$5" fontWeight="600" color="$color" marginBottom="$2">
                    Transaction Information
                  </Text>
                  
                  <DetailRow label="Transaction ID" value={transaction.id} />
                  <DetailRow label="Type" value={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} />
                  <DetailRow label="Category" value={transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)} />
                  
                  {transaction.merchant && (
                    <DetailRow label="Merchant" value={transaction.merchant} />
                  )}
                  
                  {transaction.location && (
                    <DetailRow label="Location" value={transaction.location} />
                  )}
                  
                  {transaction.reference && (
                    <DetailRow label="Reference" value={transaction.reference} sensitive />
                  )}
                  
                  {transaction.balance !== undefined && (
                    <DetailRow 
                      label="Account Balance" 
                      value={formatBalance(transaction.balance)} 
                      sensitive 
                    />
                  )}
                </YStack>
              </Card.Header>
            </Card>

            {/* Security Notice */}
            <Card elevate size="$4" bordered backgroundColor="$backgroundHover">
              <Card.Header>
                <YStack gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    🔒 Security Notice
                  </Text>
                  <Text fontSize="$3" color="$colorSubtle" lineHeight="$1">
                    Sensitive information like amounts and balances are protected by biometric authentication. 
                    Tap the eye icon to reveal or hide this information.
                  </Text>
                </YStack>
              </Card.Header>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}; 