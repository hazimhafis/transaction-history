import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { Fingerprint } from '@tamagui/lucide-icons';
import { AuthService } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [authState, setAuthState] = useState<any>(null);
  
  const authService = AuthService.getInstance();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await authService.initialize();
      const state = authService.getAuthState();
      setAuthState(state);
      
      if (state.isBiometricEnabled) {
        const types = await authService.getBiometricType();
        setBiometricTypes(types);
      }

      // If already authenticated, proceed directly
      if (authService.isAuthenticated()) {
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Initialization error:', error);
      Alert.alert('Initialization Error', error.message || 'Failed to initialize authentication');
    }
  };

  const handleBiometricLogin = async () => {
    if (isAuthenticating) return; // Prevent multiple simultaneous attempts
    
    setIsAuthenticating(true);
    try {
      const success = await authService.authenticateWithBiometrics();
      if (success) {
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert(
        'Authentication Failed',
        error.message || 'Failed to authenticate',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricButtonText = () => {
    if (biometricTypes.length === 0) {
      return 'Authenticate with Biometrics';
    }
    
    if (biometricTypes.includes('Face ID')) {
      return 'Login with Face ID';
    } else if (biometricTypes.includes('Fingerprint')) {
      return 'Login with Fingerprint';
    } else {
      return `Login with ${biometricTypes[0]}`;
    }
  };

  if (!authState) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
          <Text fontSize="$6">⏳</Text>
          <Text marginTop="$4" fontSize="$4" color="$colorSubtle">
            Initializing...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="$background" padding="$4" justifyContent="center">
        <YStack space="$6" alignItems="center">
          {/* App Logo/Title */}
          <YStack alignItems="center" space="$3">
            <Text fontSize="$10">🏦</Text>
            <Text fontSize="$8" fontWeight="700" color="$color" textAlign="center">
              Ryt Bank
            </Text>
            <Text fontSize="$5" color="$colorSubtle" textAlign="center">
              Transaction History
            </Text>
          </YStack>

          {/* Authentication Card */}
          <Card elevate size="$4" bordered backgroundColor="$background" width="100%" maxWidth={400}>
            <Card.Header>
              <YStack space="$4" alignItems="center">
                <YStack
                  width={80}
                  height={80}
                  borderRadius={40}
                  backgroundColor="$backgroundHover"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Fingerprint size={40} color="$primary" />
                </YStack>

                <YStack space="$2" alignItems="center">
                  <Text fontSize="$6" fontWeight="600" color="$color" textAlign="center">
                    Secure Access Required
                  </Text>
                  <Text fontSize="$3" color="$colorSubtle" textAlign="center" lineHeight="$1">
                    Please authenticate to view your transaction history and sensitive financial information.
                  </Text>
                </YStack>

                {authState.isBiometricEnabled ? (
                  <YStack space="$3" alignItems="center" width="100%">
                    <Button
                      size="$4"
                      theme="active"
                      onPress={handleBiometricLogin}
                      disabled={isAuthenticating}
                      opacity={isAuthenticating ? 0.7 : 1}
                      width="100%"
                      icon={Fingerprint}
                    >
                      {isAuthenticating ? 'Authenticating...' : getBiometricButtonText()}
                    </Button>
                    
                    {isAuthenticating && (
                      <Text fontSize="$3" color="$colorSubtle" textAlign="center">
                        {biometricTypes.includes('Face ID') 
                          ? 'Look at your device to authenticate'
                          : 'Place your finger on the sensor'
                        }
                      </Text>
                    )}
                  </YStack>
                ) : (
                  <YStack space="$3" alignItems="center">
                    <Text fontSize="$4" color="$warning" textAlign="center">
                      ⚠️ Biometric authentication not available
                    </Text>
                    <Text fontSize="$3" color="$colorSubtle" textAlign="center" lineHeight="$1">
                      Please ensure your device has biometric authentication enabled (Face ID, Fingerprint, etc.) 
                      and try again.
                    </Text>
                    <Button
                      size="$3"
                      variant="outlined"
                      onPress={initializeAuth}
                    >
                      Retry Setup
                    </Button>
                  </YStack>
                )}
              </YStack>
            </Card.Header>
          </Card>

          {/* Security Notice */}
          <Card elevate size="$3" bordered backgroundColor="$backgroundHover" width="100%" maxWidth={400}>
            <Card.Header>
              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  🔒 Your Security Matters
                </Text>
                <Text fontSize="$3" color="$colorSubtle" lineHeight="$1">
                  We use biometric authentication to protect your sensitive financial data. 
                  Your biometric information never leaves your device.
                </Text>
              </YStack>
            </Card.Header>
          </Card>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}; 