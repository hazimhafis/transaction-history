import { config } from '@tamagui/config'
import { createTamagui } from '@tamagui/core'

const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      background: '#ffffff',
      backgroundHover: '#f8f9fa',
      backgroundPress: '#f1f3f4',
      backgroundFocus: '#e8f0fe',
      color: '#1a1a1a',
      colorHover: '#000000',
      colorPress: '#333333',
      colorFocus: '#1a73e8',
      borderColor: '#e0e0e0',
      borderColorHover: '#d0d0d0',
      borderColorPress: '#c0c0c0',
      borderColorFocus: '#1a73e8',
      placeholderColor: '#666666',
      primary: '#1a73e8',
      primaryHover: '#1557b0',
      primaryPress: '#0f4c81',
      secondary: '#34a853',
      success: '#34a853',
      warning: '#fbbc04',
      error: '#ea4335',
    },
    dark: {
      ...config.themes.dark,
      background: '#121212',
      backgroundHover: '#1e1e1e',
      backgroundPress: '#2a2a2a',
      backgroundFocus: '#1a1a1a',
      color: '#ffffff',
      colorHover: '#f0f0f0',
      colorPress: '#e0e0e0',
      colorFocus: '#4285f4',
      borderColor: '#333333',
      borderColorHover: '#444444',
      borderColorPress: '#555555',
      borderColorFocus: '#4285f4',
      placeholderColor: '#888888',
      primary: '#4285f4',
      primaryHover: '#5a95f5',
      primaryPress: '#1a73e8',
      secondary: '#34a853',
      success: '#34a853',
      warning: '#fbbc04',
      error: '#ea4335',
    },
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
} 