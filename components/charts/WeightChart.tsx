import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { MotiView } from 'moti';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

export interface WeightData {
    value: number;
    label: string;
    date: string;
}

interface Props {
    data: WeightData[];
}

export function WeightChart({ data }: Props) {
    if (data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Weight History</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No weight logs yet.</Text>
                </View>
            </View>
        );
    }

    // Sort by date just in case
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestWeight = sortedData[sortedData.length - 1].value;
    const startWeight = sortedData[0].value;
    const diff = latestWeight - startWeight;

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Weight History</Text>
                    <Text style={styles.subtitle}>Latest: {latestWeight} kg</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: diff <= 0 ? '#E8F5E9' : '#FFXRX' }]}>
                    <Text style={[styles.badgeText, { color: diff <= 0 ? '#2E7D32' : '#C62828' }]}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                    </Text>
                </View>
            </View>

            <View style={styles.chartWrapper}>
                <LineChart
                    data={sortedData}
                    color={Colors.primary[600]}
                    thickness={3}
                    dataPointsColor={Colors.primary[800]}
                    startFillColor={Colors.primary[200]}
                    endFillColor={Colors.primary[50]}
                    startOpacity={0.9}
                    endOpacity={0.2}
                    areaChart
                    yAxisThickness={0}
                    xAxisThickness={0}
                    hideRules
                    hideYAxisText
                    height={150}
                    width={width - 80}
                    curved
                    isAnimated
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
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    chartWrapper: {
        alignItems: 'center',
        marginLeft: -10,
    },
    emptyState: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#B0BEC5',
    }
});
