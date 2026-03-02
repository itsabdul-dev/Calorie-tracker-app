export const Colors = {
  // Primary Palette (Deep Nature Green - Sophisticated & Calming)
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Base
    600: '#43A047',
    700: '#2E7D32', // Deep Emerald
    800: '#1B5E20', // Forest
    900: '#052E16', // Almost Black Green
  },

  // Accent (Electric Lime - High Energy & Modern)
  accent: {
    50: '#F9FBE7',
    100: '#F0F4C3',
    200: '#E6EE9C',
    300: '#DCE775',
    400: '#D4E157',
    500: '#CDDC39', // Base Lime
    600: '#C0CA33',
    700: '#AFB42B',
    800: '#827717',
    900: '#33691E',
  },

  // Neutrals (Clean, crisp, modern grays)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0A0A0A',
  },

  // Semantic Colors
  success: '#00C853', // Vivid Green
  warning: '#FFAB00', // Amber
  error: '#FF3D00',   // Deep Orange/Red
  info: '#2979FF',    // Electric Blue

  // Macro Colors (Vibrant & Distinct)
  macros: {
    protein: '#FF4081',    // Hot Pink
    carbs: '#FFAB40',      // Vivid Orange
    fat: '#40C4FF',        // Electric Blue
  },

  // Gradients for consistent usage
  gradients: {
    primary: ['#1B5E20', '#2E7D32', '#43A047'], // Dark to Light Green
    accent: ['#CDDC39', '#AFB42B'],             // Lime to Darker Lime
    card: ['#FFFFFF', '#FAFAFA'],               // Subtle card gradient
    background: ['#F5F7FA', '#E8F5E9'],         // Page background hint
    hero: ['#052E16', '#1B5E20', '#2E7D32'],    // Deep Forest setup
  },

  // Shadows (Soft, diffused, premium)
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1B5E20', // Colored shadow for depth
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(5, 46, 22, 0.8)', // Dark green tint
    medium: 'rgba(0, 0, 0, 0.5)',
  },

  // Legacy mappings for backward compatibility during refactor
  light: {
    text: '#052E16', // Dark Green as black
    background: '#FAFAFA',
    tint: '#CDDC39',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#2E7D32',
    primary: '#2E7D32',
    secondary: '#CDDC39',
    textPrimary: '#052E16',
    textSecondary: '#616161',
    cardBackground: '#FFFFFF',
    borderColor: '#E0E0E0',
    success: '#00C853',
    danger: '#FF3D00',
    warning: '#FFAB00',
    accent: '#CDDC39'
  },
  dark: { // Placeholder for dark mode if implemented later
    text: '#EDF7ED',
    background: '#052E16',
    tint: '#CDDC39',
    tabIconDefault: '#616161',
    tabIconSelected: '#CDDC39',
    primary: '#4CAF50',
    secondary: '#CDDC39',
    textPrimary: '#EDF7ED',
    textSecondary: '#A5D6A7',
    cardBackground: '#1B5E20',
    borderColor: '#2E7D32',
    success: '#00E676',
    danger: '#FF5252',
    warning: '#FFD740',
    accent: '#D4E157'
  }
};

export default Colors;
