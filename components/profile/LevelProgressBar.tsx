import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MotiView } from 'moti';
import { Zap } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { calculateXP, getLevel, getLevelProgress, getXPToNextLevel } from '../../lib/gamification';

interface LevelProgressBarProps {
    mealsLogged: number;
    currentStreak: number;
    daysActive: number;
}

export function LevelProgressBar({ mealsLogged, currentStreak, daysActive }: LevelProgressBarProps) {
    const xp = calculateXP(mealsLogged, currentStreak, daysActive);
    const level = getLevel(xp);
    const progress = getLevelProgress(xp);
    const xpToNext = getXPToNextLevel(xp);

    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (progress * circumference);

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 100, type: 'spring' }}
            style={styles.container}
        >
            <View style={styles.ringContainer}>
                <Svg width={size} height={size}>
                    {/* Background */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#FFFFFF"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={progressOffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelNumber}>{level.level}</Text>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.levelRow}>
                    <Zap size={16} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.levelName}>{level.name}</Text>
                </View>
                <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
                {xpToNext > 0 && (
                    <Text style={styles.nextLevelText}>
                        {xpToNext} XP to Level {level.level + 1}
                    </Text>
                )}
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 12,
        marginTop: 16,
        gap: 14,
    },
    ringContainer: {
        position: 'relative',
        width: 80,
        height: 80,
    },
    levelBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelNumber: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    infoContainer: {
        flex: 1,
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    levelName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    xpText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    nextLevelText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
});
