import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticationState, AppError } from '../types/transaction';

const AUTH_STORAGE_KEY = 'auth_state';
const AUTH_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class AuthService {
  private static instance: AuthService;
  private authState: AuthenticationState = {
    isAuthenticated: false,
    isBiometricEnabled: false,
  };

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      console.log('Biometric check:', { hasHardware, isEnrolled });
      
      this.authState.isBiometricEnabled = hasHardware && isEnrolled;
      
      // Load stored auth state
      const storedState = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        
        // Check if authentication has expired
        if (parsedState.lastAuthTime && 
            Date.now() - parsedState.lastAuthTime < AUTH_TIMEOUT) {
          this.authState = parsedState;
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
      throw new AppError({
        code: 'AUTH_INIT_FAILED',
        message: 'Failed to initialize authentication service',
        details: error,
      });
    }
  }

  async authenticateWithBiometrics(): Promise<boolean> {
    try {
      if (!this.authState.isBiometricEnabled) {
        throw new AppError({
          code: 'BIOMETRIC_NOT_AVAILABLE',
          message: 'Biometric authentication is not available on this device',
        });
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to view your transactions',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        this.authState.isAuthenticated = true;
        this.authState.lastAuthTime = Date.now();
        await this.saveAuthState();
        return true;
      } else {
        let errorMessage = 'Authentication failed';
        
        if (result.error === 'user_cancel') {
          errorMessage = 'Authentication was cancelled';
        } else if (result.error === 'user_fallback') {
          errorMessage = 'User chose fallback authentication';
        } else if (result.error === 'unknown') {
          errorMessage = 'Biometric authentication has been disabled or too many failed attempts';
        } else if (result.error === 'system_cancel') {
          errorMessage = 'Authentication was cancelled by the system';
        } else if (result.error === 'app_cancel') {
          errorMessage = 'Authentication was cancelled by the app';
        }

        throw new AppError({
          code: 'AUTH_FAILED',
          message: errorMessage,
          details: result.error,
        });
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError({
        code: 'AUTH_ERROR',
        message: 'An unexpected error occurred during authentication',
        details: error,
      });
    }
  }

  async logout(): Promise<void> {
    try {
      this.authState.isAuthenticated = false;
      this.authState.lastAuthTime = undefined;
      await this.saveAuthState();
    } catch (error) {
      console.error('Failed to logout:', error);
      throw new AppError({
        code: 'LOGOUT_FAILED',
        message: 'Failed to logout',
        details: error,
      });
    }
  }

  getAuthState(): AuthenticationState {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    if (!this.authState.isAuthenticated || !this.authState.lastAuthTime) {
      return false;
    }

    // Check if authentication has expired
    const isExpired = Date.now() - this.authState.lastAuthTime > AUTH_TIMEOUT;
    if (isExpired) {
      this.authState.isAuthenticated = false;
      this.authState.lastAuthTime = undefined;
      this.saveAuthState().catch(console.error);
      return false;
    }

    return true;
  }

  private async saveAuthState(): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.authState));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  async getBiometricType(): Promise<string[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Biometric';
        }
      });
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }
} 