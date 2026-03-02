import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Utensils, Calendar, Flame } from 'lucide-react-native';
import Colors from '../../constants/Colors';

interface ProfileStatsProps {
    mealsLogged: number;
    daysActive: number;
    currentStreak: number;
}

interface StatItemProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: string;
    delay: number;
}

function StatItem({ icon, value, label, color, delay }: StatItemProps) {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay }}
            style={styles.statItem}
        >
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                {icon}
            </View>
            <Text style={styles.statValue}>{value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </MotiView>
    );
}

export function ProfileStats({ mealsLogged, daysActive, currentStreak }: ProfileStatsProps) {
    return (
        <View style={styles.container}>
            <StatItem
                icon={<Utensils size={20} color="#4CAF50" />}
                value={mealsLogged}
                label="Meals Logged"
                color="#4CAF50"
                delay={150}
            />
            <View style={styles.divider} />
            <StatItem
                icon={<Calendar size={20} color="#2196F3" />}
                value={daysActive}
                label="Days Active"
                color="#2196F3"
                delay={200}
            />
            <View style={styles.divider} />
            <StatItem
                icon={<Flame size={20} color="#FF5722" />}
                value={currentStreak}
                label="Current Streak"
                color="#FF5722"
                delay={250}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: Colors.primary[800],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.neutral[800],
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.neutral[500],
        textAlign: 'center',
    },
    divider: {
        width: 1,
        height: 60,
        backgroundColor: Colors.neutral[200],
        marginHorizontal: 8,
    },
});
