import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import Colors from '../../constants/Colors';

interface ComparisonIndicatorProps {
    value: number;
    previousValue: number;
    label?: string;
    inverted?: boolean; // For metrics where lower is better (like calories)
}

export function ComparisonIndicator({ value, previousValue, label, inverted = false }: ComparisonIndicatorProps) {
    if (previousValue === 0) return null;

    const diff = value - previousValue;
    const percentChange = Math.round((diff / previousValue) * 100);

    if (percentChange === 0) {
        return (
            <View style={[styles.container, styles.neutral]}>
                <Minus size={12} color={Colors.neutral[500]} />
                <Text style={[styles.text, styles.neutralText]}>Same as last</Text>
            </View>
        );
    }

    const isPositive = inverted ? percentChange < 0 : percentChange > 0;
    const Icon = percentChange > 0 ? TrendingUp : TrendingDown;
    const color = isPositive ? '#4CAF50' : '#F44336';
    const bgColor = isPositive ? '#E8F5E9' : '#FFEBEE';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Icon size={12} color={color} />
            <Text style={[styles.text, { color }]}>
                {percentChange > 0 ? '+' : ''}{percentChange}% {label || 'vs last'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    neutral: {
        backgroundColor: Colors.neutral[100],
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
    },
    neutralText: {
        color: Colors.neutral[500],
    },
});
