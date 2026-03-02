import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Colors, BorderRadius, Spacing } from '../constants';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: keyof typeof Spacing;
    animated?: boolean;
    delay?: number;
}

export function Card({
    children,
    style,
    variant = 'elevated',
    padding = 'md',
    animated = true,
    delay = 0,
}: CardProps) {
    const content = (
        <View
            style={[
                styles.card,
                styles[variant],
                { padding: Spacing[padding] },
                style,
            ]}
        >
            {children}
        </View>
    );

    if (animated) {
        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                    type: 'timing',
                    duration: 400,
                    delay,
                }}
            >
                {content}
            </MotiView>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.neutral[0],
    },
    elevated: {
        shadowColor: Colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    outlined: {
        borderWidth: 1,
        borderColor: Colors.neutral[200],
    },
    filled: {
        backgroundColor: Colors.primary[50],
    },
});
