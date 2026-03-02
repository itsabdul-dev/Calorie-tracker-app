import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import Colors from '../../constants/Colors';

interface DayData {
    day: string;
    protein: number;
    carbs: number;
    fat: number;
    total: number;
}

interface DailyMacroChartProps {
    data: DayData[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MACRO_COLORS = {
    protein: Colors.macros.protein,
    carbs: Colors.macros.carbs,
    fat: Colors.macros.fat,
};

export function DailyMacroChart({ data }: DailyMacroChartProps) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const maxTotal = Math.max(...data.map(d => d.protein + d.carbs + d.fat), 1);
    const chartHeight = 140;

    const getBarHeight = (value: number) => (value / maxTotal) * chartHeight;

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Macro Distribution</Text>
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: MACRO_COLORS.protein }]} />
                        <Text style={styles.legendText}>Protein</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: MACRO_COLORS.carbs }]} />
                        <Text style={styles.legendText}>Carbs</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: MACRO_COLORS.fat }]} />
                        <Text style={styles.legendText}>Fat</Text>
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {data.map((day, index) => {
                    const proteinHeight = getBarHeight(day.protein);
                    const carbsHeight = getBarHeight(day.carbs);
                    const fatHeight = getBarHeight(day.fat);
                    const isSelected = selectedDay === index;

                    return (
                        <Pressable
                            key={day.day}
                            onPress={() => setSelectedDay(isSelected ? null : index)}
                            style={styles.barColumn}
                        >
                            <MotiView
                                from={{ height: 0 }}
                                animate={{ height: proteinHeight + carbsHeight + fatHeight }}
                                transition={{ delay: 450 + index * 50, type: 'timing', duration: 500 }}
                                style={[
                                    styles.stackedBar,
                                    isSelected && styles.selectedBar,
                                ]}
                            >
                                <View style={[styles.barSegment, { height: fatHeight, backgroundColor: MACRO_COLORS.fat }]} />
                                <View style={[styles.barSegment, { height: carbsHeight, backgroundColor: MACRO_COLORS.carbs }]} />
                                <View style={[styles.barSegment, { height: proteinHeight, backgroundColor: MACRO_COLORS.protein, borderTopLeftRadius: 6, borderTopRightRadius: 6 }]} />
                            </MotiView>
                            <Text style={[styles.dayLabel, isSelected && styles.selectedLabel]}>{day.day}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Selected Day Detail */}
            {selectedDay !== null && (
                <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={styles.detailContainer}
                >
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Protein:</Text>
                        <Text style={[styles.detailValue, { color: MACRO_COLORS.protein }]}>{data[selectedDay].protein}g</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Carbs:</Text>
                        <Text style={[styles.detailValue, { color: MACRO_COLORS.carbs }]}>{data[selectedDay].carbs}g</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fat:</Text>
                        <Text style={[styles.detailValue, { color: MACRO_COLORS.fat }]}>{data[selectedDay].fat}g</Text>
                    </View>
                </MotiView>
            )}
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
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
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[800],
        marginBottom: 10,
    },
    legend: {
        flexDirection: 'row',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: Colors.neutral[600],
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 160,
        paddingTop: 20,
    },
    barColumn: {
        alignItems: 'center',
        flex: 1,
    },
    stackedBar: {
        width: 28,
        borderRadius: 6,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    selectedBar: {
        transform: [{ scale: 1.1 }],
    },
    barSegment: {
        width: '100%',
    },
    dayLabel: {
        fontSize: 12,
        color: Colors.neutral[500],
        marginTop: 8,
        fontWeight: '500',
    },
    selectedLabel: {
        color: Colors.primary[600],
        fontWeight: '700',
    },
    detailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral[100],
    },
    detailRow: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.neutral[500],
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '700',
    },
});
