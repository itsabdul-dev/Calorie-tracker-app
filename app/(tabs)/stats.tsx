import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import Colors from '../../constants/Colors';
import { useWeeklyStats } from '../../hooks/useWeeklyStats';
import { useWeightHistory } from '../../hooks/useWeightHistory';
import { WeeklyCalorieChart } from '../../components/charts/WeeklyCalorieChart';
import { WeightChart } from '../../components/charts/WeightChart';
import { MacroPieChart } from '../../components/charts/MacroPieChart';
import {
    WeeklyProgressRing,
    TimePeriodTabs,
    TimePeriod,
    PersonalBestBadges,
    InsightCard,
    DailyMacroChart,
    ComparisonIndicator
} from '../../components/stats';
import { generateInsights, calculatePersonalBests } from '../../lib/statsInsights';
import { Plus, X, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { BlurView } from 'expo-blur';
import { Button } from '../../components/Button';
import { format } from 'date-fns';

// Skeleton loading component
function Skeleton({ width, height, style }: { width: number | string; height: number; style?: any }) {
    return (
        <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 800, loop: true, repeatReverse: true }}
            style={[{
                width,
                height,
                backgroundColor: Colors.neutral[200],
                borderRadius: 8
            }, style]}
        />
    );
}

function ChartSkeleton() {
    return (
        <View style={styles.chartSkeleton}>
            <Skeleton width={120} height={20} />
            <View style={{ marginTop: 16, gap: 12 }}>
                <Skeleton width="100%" height={160} style={{ borderRadius: 16 }} />
            </View>
        </View>
    );
}

export default function StatsScreen() {
    const { weeklyData, loading: statsLoading, averageCalories, avgMacros, daysOnTarget, refresh: refreshStats, totalCalories } = useWeeklyStats();
    const { weights, loading: weightsLoading, addWeight, refresh: refreshWeights } = useWeightHistory();
    const { profile } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [newWeight, setNewWeight] = useState('');
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<any>(null);

    const goal = profile?.daily_calorie_goal || 2000;
    const weeklyGoalMet = totalCalories >= (goal * 7 * 0.9) && totalCalories <= (goal * 7 * 1.1);

    // Check for weekly goal achievement
    useEffect(() => {
        if (weeklyGoalMet && !statsLoading) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
    }, [weeklyGoalMet, statsLoading]);

    // Generate insights
    const insights = useMemo(() => {
        if (!weeklyData || weeklyData.length === 0) return [];
        const mappedData = weeklyData.map(d => ({
            day: d.dayLabel,
            calories: d.calories,
            protein: d.protein,
            carbs: d.carbs,
            fat: d.fat
        }));
        return generateInsights(mappedData, [], goal);
    }, [weeklyData, goal]);

    // Personal bests
    const personalBests = useMemo(() => {
        if (!weeklyData || weeklyData.length === 0) return { bestStreak: 0, lowestCalorieDay: 0, highestCalorieDay: 0 };
        const mappedData = weeklyData.map(d => ({
            day: d.dayLabel,
            calories: d.calories,
            protein: d.protein,
            carbs: d.carbs,
            fat: d.fat
        }));
        const streak = 0; // Streak is tracked elsewhere
        return calculatePersonalBests(mappedData, streak);
    }, [weeklyData]);

    // Daily macro data for chart
    const dailyMacroData = useMemo(() => {
        if (!weeklyData) return [];
        return weeklyData.map(d => ({
            day: d.dayLabel.slice(0, 3),
            protein: d.protein || 0,
            carbs: d.carbs || 0,
            fat: d.fat || 0,
            total: d.calories || 0,
        }));
    }, [weeklyData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refreshStats(), refreshWeights()]);
        setRefreshing(false);
    };

    const handleAddWeight = async () => {
        if (!newWeight || isNaN(Number(newWeight))) {
            Alert.alert('Invalid Input', 'Please enter a valid number for weight.');
            return;
        }

        try {
            await addWeight(Number(newWeight));
            setShowWeightModal(false);
            setNewWeight('');
        } catch (e) {
            Alert.alert('Error', 'Failed to save weight log.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Confetti Effect */}
            {showConfetti && (
                <ConfettiCannon
                    ref={confettiRef}
                    count={150}
                    origin={{ x: -10, y: 0 }}
                    fadeOut
                    explosionSpeed={350}
                    fallSpeed={2500}
                />
            )}

            {/* Header */}
            <LinearGradient
                colors={[Colors.primary[800], Colors.primary[600]]}
                style={styles.headerBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={styles.headerContent}
                >
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.headerTitle}>Insights</Text>
                            <Text style={styles.headerSubtitle}>Your Progress Analytics</Text>
                        </View>
                        <View style={styles.headerIcon}>
                            <Sparkles size={24} color="#FFF" />
                        </View>
                    </View>
                </MotiView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Time Period Tabs */}
                <TimePeriodTabs selected={timePeriod} onChange={setTimePeriod} />

                {/* Weekly Progress Ring */}
                {statsLoading ? (
                    <ChartSkeleton />
                ) : (
                    <WeeklyProgressRing
                        currentCalories={totalCalories || 0}
                        goalCalories={goal}
                        daysLogged={weeklyData?.filter(d => d.calories > 0).length || 0}
                    />
                )}

                {/* AI Insights */}
                {insights.length > 0 && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 150 }}
                    >
                        <Text style={styles.sectionTitle}>AI Insights</Text>
                        {insights.map((insight, index) => (
                            <InsightCard
                                key={index}
                                type={insight.type}
                                title={insight.title}
                                message={insight.message}
                                delay={200 + index * 100}
                            />
                        ))}
                    </MotiView>
                )}

                {/* Personal Best Badges */}
                <PersonalBestBadges
                    bestStreak={personalBests.bestStreak}
                    lowestCalorieDay={personalBests.lowestCalorieDay}
                    highestCalorieDay={personalBests.highestCalorieDay}
                    daysOnTarget={daysOnTarget}
                    weeklyGoalMet={weeklyGoalMet}
                />

                {/* Calorie Chart */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 300 }}
                >
                    {statsLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <WeeklyCalorieChart
                            data={weeklyData}
                            goal={goal}
                        />
                    )}
                </MotiView>

                {/* Daily Macro Chart */}
                {dailyMacroData.length > 0 && (
                    <DailyMacroChart data={dailyMacroData} />
                )}

                {/* Macro Pie Chart */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 450 }}
                >
                    <MacroPieChart
                        protein={avgMacros.protein}
                        carbs={avgMacros.carbs}
                        fat={avgMacros.fat}
                    />
                </MotiView>

                {/* Weight Chart */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 500 }}
                    style={{ marginBottom: 20 }}
                >
                    <WeightChart data={weights.map(w => ({ value: w.weight, label: w.date, date: w.date }))} />

                    <TouchableOpacity
                        style={styles.addWeightButton}
                        onPress={() => setShowWeightModal(true)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[Colors.neutral[800], Colors.neutral[900]]}
                            style={styles.addWeightGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Plus size={18} color="#FFF" />
                            <Text style={styles.addWeightText}>Log Weight</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </MotiView>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Weight Input Modal */}
            <Modal
                visible={showWeightModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowWeightModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Log Weight</Text>
                            <TouchableOpacity onPress={() => setShowWeightModal(false)} style={styles.closeButton}>
                                <X size={24} color={Colors.neutral[500]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="0.0"
                                keyboardType="decimal-pad"
                                value={newWeight}
                                onChangeText={setNewWeight}
                                autoFocus
                            />
                            <Text style={styles.inputUnit}>kg</Text>
                        </View>

                        <Text style={styles.dateHelper}>For today, {format(new Date(), 'MMM d, yyyy')}</Text>

                        <Button
                            title="Save Log"
                            onPress={handleAddWeight}
                            style={{ marginTop: 24 }}
                        />
                    </MotiView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    headerBackground: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: -30,
        zIndex: 1,
        shadowColor: Colors.primary[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    headerContent: {
        flexDirection: 'column',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[800],
        marginBottom: 12,
    },
    chartSkeleton: {
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
    addWeightButton: {
        marginTop: -20,
        alignSelf: 'center',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    addWeightGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        gap: 8,
    },
    addWeightText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.neutral[900],
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary[500],
        paddingBottom: 8,
        marginBottom: 16,
    },
    input: {
        fontSize: 40,
        fontWeight: '800',
        color: Colors.neutral[900],
        textAlign: 'center',
        minWidth: 100,
    },
    inputUnit: {
        fontSize: 24,
        color: Colors.neutral[400],
        marginLeft: 8,
        fontWeight: '600',
        marginBottom: 6,
    },
    dateHelper: {
        textAlign: 'center',
        color: Colors.neutral[400],
        fontSize: 14,
        marginBottom: 8,
    },
});
