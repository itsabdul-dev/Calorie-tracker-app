import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Lock } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { Achievement, ACHIEVEMENTS, getUnlockedAchievements } from '../../lib/gamification';

interface AchievementBadgeProps {
    achievement: Achievement;
    unlocked: boolean;
    delay?: number;
}

function AchievementBadge({ achievement, unlocked, delay = 0 }: AchievementBadgeProps) {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: 'spring' }}
            style={[
                styles.badge,
                { backgroundColor: unlocked ? achievement.bgColor : Colors.neutral[100] },
                !unlocked && styles.lockedBadge,
            ]}
        >
            <View style={[
                styles.iconContainer,
                { backgroundColor: unlocked ? achievement.color + '20' : Colors.neutral[200] }
            ]}>
                {unlocked ? (
                    <Text style={styles.emoji}>{achievement.icon}</Text>
                ) : (
                    <Lock size={20} color={Colors.neutral[400]} />
                )}
            </View>
            <Text style={[
                styles.title,
                { color: unlocked ? achievement.color : Colors.neutral[400] }
            ]}>
                {achievement.title}
            </Text>
            <Text style={[
                styles.description,
                !unlocked && styles.lockedText
            ]}>
                {achievement.description}
            </Text>
        </MotiView>
    );
}

interface AchievementBadgesProps {
    mealsLogged: number;
    currentStreak: number;
    daysActive: number;
    goalsMet?: number;
}

export function AchievementBadges({
    mealsLogged,
    currentStreak,
    daysActive,
    goalsMet = 0
}: AchievementBadgesProps) {
    const unlockedIds = getUnlockedAchievements(mealsLogged, currentStreak, daysActive, goalsMet)
        .map(a => a.id);

    const unlockedCount = unlockedIds.length;

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {ACHIEVEMENTS.map((achievement, index) => (
                    <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={unlockedIds.includes(achievement.id)}
                        delay={250 + index * 50}
                    />
                ))}
            </ScrollView>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[800],
    },
    countBadge: {
        backgroundColor: Colors.primary[100],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary[700],
    },
    scrollContent: {
        gap: 12,
        paddingRight: 24,
    },
    badge: {
        width: 110,
        padding: 14,
        borderRadius: 20,
        alignItems: 'center',
    },
    lockedBadge: {
        opacity: 0.7,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    emoji: {
        fontSize: 22,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    description: {
        fontSize: 10,
        color: Colors.neutral[500],
        textAlign: 'center',
    },
    lockedText: {
        color: Colors.neutral[400],
    },
});
