import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../utils/haptics';
import { Colors, Typography, BorderRadius, Spacing } from '../constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: any;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    fullWidth = false,
    style,
}: ButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    const handlePressIn = () => {
        setIsPressed(true);
        hapticFeedback.light();
    };

    const handlePressOut = () => {
        setIsPressed(false);
    };

    const handlePress = () => {
        hapticFeedback.medium();
        onPress();
    };

    return (
        <MotiView
            animate={{
                scale: isPressed ? 0.96 : 1,
            }}
            transition={{ type: 'timing', duration: 100 }}
            style={[fullWidth && { width: '100%' }, style]}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={[
                    styles.button,
                    styles[variant],
                    styles[size],
                    (disabled || loading) && styles.disabled,
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? Colors.neutral[900] : Colors.accent[500]}
                    />
                ) : (
                    <>
                        {icon && <MotiView style={styles.icon}>{icon}</MotiView>}
                        <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
                            {title}
                        </Text>
                    </>
                )}
            </Pressable>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
        shadowColor: Colors.shadow.md.shadowColor,
        shadowOffset: Colors.shadow.md.shadowOffset,
        shadowOpacity: Colors.shadow.md.shadowOpacity,
        shadowRadius: Colors.shadow.md.shadowRadius,
        elevation: Colors.shadow.md.elevation,
    },

    // Variants
    primary: {
        backgroundColor: Colors.accent[500],
    },
    secondary: {
        backgroundColor: Colors.neutral[0],
        borderWidth: 1.5,
        borderColor: Colors.neutral[300],
    },
    ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    danger: {
        backgroundColor: Colors.error,
    },

    // Sizes
    small: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 36,
    },
    medium: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 48,
    },
    large: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        minHeight: 56,
    },

    // Text styles
    text: {
        ...Typography.labelLarge,
        fontWeight: '600',
    },
    primaryText: {
        color: Colors.neutral[900],
    },
    secondaryText: {
        color: Colors.neutral[700],
    },
    ghostText: {
        color: Colors.accent[600],
    },
    dangerText: {
        color: Colors.neutral[0],
    },
    smallText: {
        ...Typography.labelMedium,
    },
    mediumText: {
        ...Typography.labelLarge,
    },
    largeText: {
        fontSize: 16,
        fontWeight: '600',
    },

    disabled: {
        opacity: 0.5,
    },
    icon: {
        marginRight: Spacing.sm,
    },
});
