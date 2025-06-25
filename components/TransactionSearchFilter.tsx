import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { X, ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { TransactionCategory } from '../types/transaction';

interface TransactionSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: TransactionCategory | 'all';
  onCategoryChange: (category: TransactionCategory | 'all') => void;
  onClearFilters: () => void;
}

const CATEGORIES: { value: TransactionCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Categories', icon: '📋' },
  { value: 'grocery', label: 'Grocery', icon: '🛒' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'gas', label: 'Gas', icon: '⛽' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'transfer', label: 'Transfer', icon: '💸' },
  { value: 'salary', label: 'Salary', icon: '💰' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export const TransactionSearchFilter: React.FC<TransactionSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onClearFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce search input - 300ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onSearchChange]);

  // Update input value when searchQuery changes (e.g., when cleared)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Memoize search query related calculations
  const hasActiveFilters = useMemo(() => {
    return searchQuery.length > 0 || selectedCategory !== 'all';
  }, [searchQuery, selectedCategory]);

  const selectedCategoryData = CATEGORIES.find(cat => cat.value === selectedCategory);

  return (
    <YStack gap="$3" padding="$4" backgroundColor="$background">
      {/* Search Input */}
      <XStack gap="$2" alignItems="center">
        <YStack flex={1}>
          <TextInput
            placeholder="Search transactions..."
            value={inputValue}
            onChangeText={setInputValue}
            style={{
              height: 48,
              borderWidth: 1,
              borderColor: '#d0d0d0',
              borderRadius: 8,
              paddingHorizontal: 12,
              fontSize: 16,
              backgroundColor: '#f8f9fa',
            }}
            placeholderTextColor="#666666"
          />
        </YStack>
      </XStack>

      {/* Filter Row */}
      <XStack gap="$2" alignItems="center" justifyContent="space-between">
        <XStack gap="$2" alignItems="center" flex={1}>
          {/* Category Filter Dropdown */}
          <Button
            onPress={() => setIsFilterOpen(!isFilterOpen)}
            size="$4"
            iconAfter={isFilterOpen ? ChevronUp : ChevronDown}
            backgroundColor="$backgroundSoft"
            borderColor="$borderColorHover"
            minWidth={180}
          >
            <XStack gap="$2" alignItems="center">
              <Text fontSize="$3">{selectedCategoryData?.icon}</Text>
              <Text fontSize="$3" color="$color">
                {selectedCategoryData?.label}
              </Text>
            </XStack>
          </Button>
        </XStack>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            size="$3"
            chromeless
            icon={X}
            onPress={onClearFilters}
            backgroundColor="$red2"
            color="$red10"
            borderColor="$red6"
            hoverStyle={{
              backgroundColor: '$red3',
            }}
            pressStyle={{
              backgroundColor: '$red4',
            }}
          >
            Clear
          </Button>
        )}
      </XStack>

      {/* Category Filter Options */}
      {isFilterOpen && (
        <YStack
          gap="$2"
          backgroundColor="$backgroundSoft"
          padding="$3"
          borderRadius="$4"
          borderColor="$borderColorHover"
          borderWidth={1}
          maxHeight={300}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap="$1">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.value}
                  onPress={() => {
                    onCategoryChange(category.value);
                    setIsFilterOpen(false);
                  }}
                  size="$3"
                  backgroundColor={
                    selectedCategory === category.value ? '$blue3' : 'transparent'
                  }
                  borderColor={
                    selectedCategory === category.value ? '$blue8' : 'transparent'
                  }
                  borderWidth={selectedCategory === category.value ? 1 : 0}
                  justifyContent="flex-start"
                  color={selectedCategory === category.value ? '$blue11' : '$color'}
                >
                  <XStack gap="$2" alignItems="center" width="100%">
                    <Text fontSize="$3">{category.icon}</Text>
                    <Text fontSize="$3" flex={1} textAlign="left">{category.label}</Text>
                    {selectedCategory === category.value && (
                      <Text fontSize="$2">✓</Text>
                    )}
                  </XStack>
                </Button>
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <XStack gap="$2" alignItems="center" flexWrap="wrap">
          <Text fontSize="$2" color="$colorSubtle">
            Active filters:
          </Text>
          
          {searchQuery.length > 0 && (
            <XStack
              gap="$1"
              alignItems="center"
              backgroundColor="$blue2"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
              borderColor="$blue6"
              borderWidth={1}
            >
              <Text fontSize="$2" color="$blue11">
                Search: "{searchQuery}"
              </Text>
            </XStack>
          )}
          
          {selectedCategory !== 'all' && (
            <XStack
              gap="$1"
              alignItems="center"
              backgroundColor="$green2"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
              borderColor="$green6"
              borderWidth={1}
            >
              <Text fontSize="$2">{selectedCategoryData?.icon}</Text>
              <Text fontSize="$2" color="$green11">
                {selectedCategoryData?.label}
              </Text>
            </XStack>
          )}
        </XStack>
      )}
    </YStack>
  );
}; 