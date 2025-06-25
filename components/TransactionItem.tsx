import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { Card } from '@tamagui/card';
import { XStack, YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Eye, EyeOff } from '@tamagui/lucide-icons';
import { Transaction } from '../types/transaction';
import { TransactionService } from '../services/transactionService';
import { useAuth } from '../hooks/AuthContext';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
  showAmount?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  showAmount: initialShowAmount = false,
}) => {
  const [showAmount, setShowAmount] = useState(initialShowAmount);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { isTransactionAuthenticated, authenticateForTransaction } = useAuth();
  const transactionService = TransactionService.getInstance();

  const handleToggleAmount = async () => {
    if (showAmount) {
      setShowAmount(false);
      return;
    }

    // If already authenticated for this transaction, show amount immediately
    if (isTransactionAuthenticated(transaction.id)) {
      setShowAmount(true);
      return;
    }

    setIsAuthenticating(true);
    try {
      const success = await authenticateForTransaction(transaction.id);
      if (success) {
        setShowAmount(true);
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
    // Show amount if either locally shown or authenticated for this transaction
    const shouldShowAmount = showAmount || isTransactionAuthenticated(transaction.id);
    if (!shouldShowAmount) {
      return '****';
    }
    
    const formatted = transactionService.formatAmount(amount);
    return transaction.type === 'debit' ? `-${formatted}` : `+${formatted}`;
  };

  const getAmountColor = () => {
    // Show color if either locally shown or authenticated for this transaction
    const shouldShowAmount = showAmount || isTransactionAuthenticated(transaction.id);
    if (!shouldShowAmount) {
      return '$color';
    }
    return transaction.type === 'debit' ? '$red10' : '$green10';
  };

  const formatDate = () => {
    const date = new Date(transaction.date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return transactionService.formatDate(transaction.date);
    }
  };

  return (
    <Card
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      onPress={onPress}
      marginBottom="$2"
      backgroundColor="$background"
    >
      <Card.Header>
        <XStack gap="$4" alignItems="center">
          {/* Transaction Icon */}
          <YStack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor="$backgroundHover"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="$6">
              {transactionService.getTransactionIcon(transaction.category)}
            </Text>
          </YStack>

          {/* Transaction Details */}
          <YStack flex={1} gap="$1">
            <Text fontSize="$5" fontWeight="600" color="$color">
              {transaction.description}
            </Text>
            <Text fontSize="$3" color="$colorSubtle">
              {transaction.merchant || transaction.category}
            </Text>
            <Text fontSize="$2" color="$colorSubtle">
              {formatDate()}
            </Text>
          </YStack>

          {/* Amount and Eye Icon */}
          <YStack alignItems="flex-end" gap="$2">
            <Text
              fontSize="$5"
              fontWeight="600"
              color={getAmountColor()}
            >
              {formatAmount(transaction.amount)}
            </Text>
            
            <Button
              size="$2"
              chromeless
              icon={(showAmount || isTransactionAuthenticated(transaction.id)) ? EyeOff : Eye}
              onPress={handleToggleAmount}
              disabled={isAuthenticating}
              opacity={isAuthenticating ? 0.5 : 1}
              scaleIcon={1.2}
            />
          </YStack>
        </XStack>
      </Card.Header>
    </Card>
  );
};