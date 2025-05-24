import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Search, LogOut } from '@tamagui/lucide-icons';
import { Transaction, TransactionListResponse } from '../types/transaction';
import { TransactionService } from '../services/transactionService';
import { AuthService } from '../services/authService';
import { TransactionItem } from '../components/TransactionItem';

interface TransactionHistoryScreenProps {
  onTransactionPress: (transaction: Transaction) => void;
  onLogout: () => void;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  onTransactionPress,
  onLogout,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionService = TransactionService.getInstance();
  const authService = AuthService.getInstance();

  const loadTransactions = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setError(null);
      
      if (page === 1 && !append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response: TransactionListResponse = await transactionService.getTransactions(page, 20);
      
      if (append) {
        setTransactions(prev => [...prev, ...response.transactions]);
      } else {
        setTransactions(response.transactions);
      }
      
      setHasMore(response.hasMore);
      setCurrentPage(page);
    } catch (error: any) {
      setError(error.message || 'Failed to load transactions');
      Alert.alert('Error', error.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [transactionService]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await transactionService.refreshTransactions();
      await loadTransactions(1, false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to refresh transactions');
    } finally {
      setIsRefreshing(false);
    }
  }, [transactionService, loadTransactions]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadTransactions(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, currentPage, loadTransactions]);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              onLogout();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  }, [authService, onLogout]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => onTransactionPress(item)}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <YStack padding="$4" alignItems="center">
        <Text fontSize="$3" color="$colorSubtle">Loading more...</Text>
      </YStack>
    );
  };

  const renderEmptyState = () => (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Text fontSize="$6" marginBottom="$2">💳</Text>
      <Text fontSize="$5" fontWeight="600" marginBottom="$2" textAlign="center">
        No Transactions Found
      </Text>
      <Text fontSize="$3" color="$colorSubtle" textAlign="center">
        Your transaction history will appear here once you make some transactions.
      </Text>
    </YStack>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text fontSize="$6" marginBottom="$4">⏳</Text>
          <Text fontSize="$4" color="$colorSubtle">
            Loading transactions...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

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
          <YStack>
            <Text fontSize="$7" fontWeight="700" color="$color">
              Transactions
            </Text>
            <Text fontSize="$3" color="$colorSubtle">
              {transactions.length} transactions
            </Text>
          </YStack>
          
          <XStack space="$2">
            <Button
              size="$3"
              chromeless
              icon={Search}
              onPress={() => {
                // TODO: Implement search functionality
                Alert.alert('Search', 'Search functionality coming soon!');
              }}
            />
            <Button
              size="$3"
              chromeless
              icon={LogOut}
              onPress={handleLogout}
            />
          </XStack>
        </XStack>

        {/* Transaction List */}
        <YStack flex={1}>
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ 
              padding: 16,
              paddingBottom: 100,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#1a73e8"
                colors={['#1a73e8']}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}; 