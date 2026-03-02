import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FoodEntry } from '../types';
import Colors from '../constants/Colors';
import { Trash2 } from 'lucide-react-native';

export default function FoodCard({ item, onDelete }: { item: FoodEntry; onDelete?: () => void }) {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.food_name}</Text>
                <Text style={styles.details}>
                    {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                </Text>
                {item.serving_size && <Text style={styles.serving}>{item.serving_size}</Text>}
            </View>
            {onDelete && (
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton} hitSlop={20}>
                    <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.neutral[0],
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.neutral[900],
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
        color: Colors.neutral[600],
    },
    serving: {
        fontSize: 12,
        color: Colors.neutral[500],
        marginTop: 2,
        fontStyle: 'italic',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
    },
});
