import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MotiView } from 'moti';
import Colors from '../../constants/Colors';

interface WeeklyProgressRingProps {
    currentCalories: number;
    goalCalories: number;
    daysLogged: number;
}

export function WeeklyProgressRing({ currentCalories, goalCalories, daysLogged }: WeeklyProgressRingProps) {
    const size = 160;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const weeklyGoal = goalCalories * 7;
    const progress = Math.min(currentCalories / weeklyGoal, 1);
    const progressOffset = circumference - (progress * circumference);
    const percentage = Math.round(progress * 100);

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            style={styles.container}
        >
            <View style={styles.ringContainer}>
                <Svg width={size} height={size} style={styles.svg}>
                    {/* Background Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={Colors.neutral[200]}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={Colors.primary[500]}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={progressOffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>

                {/* Center Content */}
                <View style={styles.centerContent}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                    <Text style={styles.labelText}>Weekly Goal</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(currentCalories).toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Total Cal</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{daysLogged}/7</Text>
                    <Text style={styles.statLabel}>Days Logged</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(weeklyGoal - currentCalories).toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Remaining</Text>
                </View>
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
        shadowColor: Colors.primary[800],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        alignItems: 'center',
    },
    ringContainer: {
        position: 'relative',
        width: 160,
        height: 160,
        marginBottom: 20,
    },
    svg: {
        transform: [{ rotateZ: '0deg' }],
    },
    centerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.primary[700],
        letterSpacing: -1,
    },
    labelText: {
        fontSize: 13,
        color: Colors.neutral[500],
        fontWeight: '600',
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[800],
    },
    statLabel: {
        fontSize: 12,
        color: Colors.neutral[500],
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.neutral[200],
    },
});
