import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { MotiView } from 'moti';
import Colors from '../../constants/Colors';
import { DailyStat } from '../../hooks/useWeeklyStats';

const { width } = Dimensions.get('window');

interface Props {
    data: DailyStat[];
    goal: number;
}

export function WeeklyCalorieChart({ data, goal }: Props) {
    const chartData = data.map(item => ({
        value: item.calories,
        label: item.dayLabel,
        frontColor: item.calories > goal ? '#FF5252' : Colors.primary[500],
        topLabelComponent: () => (
            <Text style={{ color: '#90A4AE', fontSize: 10, marginBottom: 4 }}>
                {item.calories > 0 ? item.calories : ''}
            </Text>
        ),
    }));

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Weekly Calories</Text>
                <Text style={styles.subtitle}>Goal: {goal} kcal</Text>
            </View>

            <View style={styles.chartWrapper}>
                <BarChart
                    data={chartData}
                    barWidth={22}
                    noOfSections={3}
                    barBorderRadius={4}
                    frontColor={Colors.primary[500]}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    hideRules
                    height={180}
                    width={width - 80}
                    labelTextStyle={{ color: '#90A4AE', fontSize: 12 }}
                    disablePress={false} // Enable press for tooltip potentially
                />
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#263238',
    },
    subtitle: {
        fontSize: 14,
        color: '#90A4AE',
        fontWeight: '600',
    },
    chartWrapper: {
        alignItems: 'center',
        marginLeft: -10, // Adjust for chart padding
    },
});
