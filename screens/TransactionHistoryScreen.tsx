import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { LogOut } from '@tamagui/lucide-icons';
import { Transaction, TransactionListResponse, TransactionCategory } from '../types/transaction';
import { TransactionService } from '../services/transactionService';
import { AuthService } from '../services/authService';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionSearchFilter } from '../components/TransactionSearchFilter';
import { useAuth } from '../hooks/AuthContext';

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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | 'all'>('all');

  const transactionService = TransactionService.getInstance();
  const authService = AuthService.getInstance();
  const { isAuthenticated } = useAuth();

  // Filter transactions based on search query and category
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(query) ||
        transaction.merchant?.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.reference?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    return filtered;
  }, [transactions, searchQuery, selectedCategory]);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

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
    // Only allow pagination when no filters are active
    const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== 'all';
    if (!isLoadingMore && hasMore && !hasActiveFilters) {
      loadTransactions(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, currentPage, loadTransactions, searchQuery, selectedCategory]);

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      onLogout();
    }
  }, [isAuthenticated, onLogout]);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => onTransactionPress(item)}
    />
  );

  const renderFooter = () => {
    const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== 'all';
    
    if (!isLoadingMore) return null;
    
    // Don't show loading footer when filtering
    if (hasActiveFilters) return null;
    
    return (
      <YStack padding="$4" alignItems="center">
        <Text fontSize="$3" color="$colorSubtle">Loading more...</Text>
      </YStack>
    );
  };

  const renderEmptyState = () => {
    const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== 'all';
    
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Text fontSize="$6" marginBottom="$2">
          {hasActiveFilters ? '🔍' : '💳'}
        </Text>
        <Text fontSize="$5" fontWeight="600" marginBottom="$2" textAlign="center">
          {hasActiveFilters ? 'No Matching Transactions' : 'No Transactions Found'}
        </Text>
        <Text fontSize="$3" color="$colorSubtle" textAlign="center">
          {hasActiveFilters 
            ? 'Try adjusting your search or filter criteria.' 
            : 'Your transaction history will appear here once you make some transactions.'
          }
        </Text>
      </YStack>
    );
  };

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
              {filteredTransactions.length} of {transactions.length} transactions
            </Text>
          </YStack>
          
          <XStack gap="$2">
            <Button
              size="$6"
              chromeless
              icon={LogOut}
              onPress={handleLogout}
            />
          </XStack>
        </XStack>

        {/* Search and Filter */}
        <TransactionSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onClearFilters={handleClearFilters}
        />

        {/* Transaction List */}
        <YStack flex={1}>
          <FlatList
            data={filteredTransactions}
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