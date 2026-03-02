import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import Colors from '../../constants/Colors';

type TimePeriod = 'week' | 'month' | '3months';

interface TimePeriodTabsProps {
    selected: TimePeriod;
    onChange: (period: TimePeriod) => void;
}

const periods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: '3months', label: '3 Months' },
];

export function TimePeriodTabs({ selected, onChange }: TimePeriodTabsProps) {
    return (
        <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 50 }}
            style={styles.container}
        >
            {periods.map((period) => (
                <Pressable
                    key={period.key}
                    onPress={() => onChange(period.key)}
                    style={[
                        styles.tab,
                        selected === period.key && styles.activeTab,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            selected === period.key && styles.activeTabText,
                        ]}
                    >
                        {period.label}
                    </Text>
                </Pressable>
            ))}
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.neutral[100],
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: Colors.primary[700],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.neutral[500],
    },
    activeTabText: {
        color: Colors.primary[700],
    },
});

export type { TimePeriod };
