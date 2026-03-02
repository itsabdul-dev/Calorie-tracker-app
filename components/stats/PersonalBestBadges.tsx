import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Flame, Trophy, Calendar, Zap, Star } from 'lucide-react-native';
import Colors from '../../constants/Colors';

interface Badge {
    type: 'streak' | 'best_day' | 'consistent' | 'low_day' | 'goal_crusher';
    title: string;
    value: string;
    color: string;
    bgColor: string;
}

interface PersonalBestBadgesProps {
    bestStreak: number;
    lowestCalorieDay: number;
    highestCalorieDay: number;
    daysOnTarget: number;
    weeklyGoalMet: boolean;
}

export function PersonalBestBadges({
    bestStreak,
    lowestCalorieDay,
    highestCalorieDay,
    daysOnTarget,
    weeklyGoalMet,
}: PersonalBestBadgesProps) {
    const badges: Badge[] = [
        {
            type: 'streak',
            title: 'Best Streak',
            value: `${bestStreak} days`,
            color: '#FF5722',
            bgColor: '#FBE9E7',
        },
        {
            type: 'consistent',
            title: 'Consistency',
            value: `${daysOnTarget}/7 days`,
            color: '#2196F3',
            bgColor: '#E3F2FD',
        },
        {
            type: 'low_day',
            title: 'Lowest Day',
            value: `${lowestCalorieDay} cal`,
            color: '#4CAF50',
            bgColor: '#E8F5E9',
        },
        {
            type: 'best_day',
            title: 'Highest Day',
            value: `${highestCalorieDay} cal`,
            color: '#9C27B0',
            bgColor: '#F3E5F5',
        },
    ];

    if (weeklyGoalMet) {
        badges.unshift({
            type: 'goal_crusher',
            title: 'Goal Crusher! 🎯',
            value: 'This week',
            color: '#FFB300',
            bgColor: '#FFF8E1',
        });
    }

    const getIcon = (type: Badge['type'], color: string) => {
        const iconProps = { size: 18, color };
        switch (type) {
            case 'streak': return <Flame {...iconProps} fill={color} />;
            case 'goal_crusher': return <Trophy {...iconProps} />;
            case 'consistent': return <Calendar {...iconProps} />;
            case 'low_day': return <Zap {...iconProps} />;
            case 'best_day': return <Star {...iconProps} fill={color} />;
            default: return <Star {...iconProps} />;
        }
    };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.container}
        >
            <Text style={styles.sectionTitle}>Personal Bests</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {badges.map((badge, index) => (
                    <MotiView
                        key={badge.type}
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 250 + index * 80 }}
                        style={[styles.badge, { backgroundColor: badge.bgColor }]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: badge.color + '20' }]}>
                            {getIcon(badge.type, badge.color)}
                        </View>
                        <Text style={[styles.badgeTitle, { color: badge.color }]}>{badge.title}</Text>
                        <Text style={styles.badgeValue}>{badge.value}</Text>
                    </MotiView>
                ))}
            </ScrollView>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[800],
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    scrollContent: {
        paddingRight: 20,
        gap: 12,
    },
    badge: {
        padding: 16,
        borderRadius: 20,
        minWidth: 120,
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    badgeTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    badgeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.neutral[700],
    },
});
