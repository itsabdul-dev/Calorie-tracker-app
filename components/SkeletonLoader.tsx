import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Colors, BorderRadius } from '../constants';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function Skeleton({
    width = '100%',
    height = 20,
    borderRadius = BorderRadius.sm,
    style,
}: SkeletonProps) {
    return (
        <MotiView
            from={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
            }}
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                },
                style,
            ]}
        />
    );
}

export function FoodCardSkeleton() {
    return (
        <View style={styles.card}>
            <Skeleton width={150} height={16} />
            <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: Colors.neutral[200],
    },
    card: {
        padding: 16,
        backgroundColor: Colors.neutral[0],
        borderRadius: BorderRadius.lg,
        marginBottom: 8,
    },
});
