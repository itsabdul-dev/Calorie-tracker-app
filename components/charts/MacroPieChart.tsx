import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { MotiView } from 'moti';
import Colors from '../../constants/Colors';

interface Props {
    protein: number;
    carbs: number;
    fat: number;
}

export function MacroPieChart({ protein, carbs, fat }: Props) {
    const total = protein + carbs + fat || 1;

    const data = [
        { value: protein, color: Colors.macros.protein, text: 'Protein' },
        { value: carbs, color: Colors.macros.carbs, text: 'Carbs' },
        { value: fat, color: Colors.macros.fat, text: 'Fat' },
    ];

    const renderLegend = (color: string, label: string, value: number) => (
        <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <View>
                <Text style={styles.legendLabel}>{label}</Text>
                <Text style={styles.legendValue}>{Math.round((value / total) * 100)}% ({Math.round(value)}g)</Text>
            </View>
        </View>
    );

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 700, delay: 200 }}
            style={styles.container}
        >
            <Text style={styles.title}>Macro Distribution</Text>

            <View style={styles.content}>
                <PieChart
                    data={data}
                    donut
                    sectionAutoFocus
                    radius={70}
                    innerRadius={50}
                    innerCircleColor={'#FFF'}
                    centerLabelComponent={() => {
                        return (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 22, color: 'black', fontWeight: 'bold' }}>
                                    {Math.round(total)}g
                                </Text>
                                <Text style={{ fontSize: 12, color: 'gray' }}>Avg/Day</Text>
                            </View>
                        );
                    }}
                />

                <View style={styles.legendContainer}>
                    {renderLegend(Colors.macros.protein, 'Protein', protein)}
                    {renderLegend(Colors.macros.carbs, 'Carbs', carbs)}
                    {renderLegend(Colors.macros.fat, 'Fat', fat)}
                </View>
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#263238',
        marginBottom: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendContainer: {
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendLabel: {
        fontSize: 14,
        color: '#546E7A',
        fontWeight: '500',
    },
    legendValue: {
        fontSize: 12,
        color: '#90A4AE',
    },
});
