import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface MacroBarProps {
    label: string;
    value: number; // in grams
    total: number; // goal in grams or total consumed
    color: string;
}

export default function MacroBar({ label, value, total, color }: MacroBarProps) {
    // Simple percentage calculation
    const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.value}>{Math.round(value)}g</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    barContainer: {
        height: 6,
        width: '100%',
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    value: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textPrimary,
    },
});
