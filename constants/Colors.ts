const tintColorLight = '#1A4D2E';
const tintColorDark = '#D4FF00';

export default {
  light: {
    text: '#1F2937',
    background: '#E8F5E8', // Soft green background
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    cardBackground: '#FFFFFF',
    primary: '#D4FF00', // Neon lime
    secondary: '#1A4D2E', // Dark green for contrast text/elements
    accent: '#4FD1C5', // Teal-ish accent
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    inputBackground: '#F3F4F6',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    borderColor: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    background: '#0D1F12', // Very dark green/black
    tint: tintColorDark,
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    cardBackground: '#1A2E1F',
    primary: '#D4FF00',
    secondary: '#E8F5E8',
    accent: '#38B2AC',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    inputBackground: '#374151',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    borderColor: '#374151',
  },
};
