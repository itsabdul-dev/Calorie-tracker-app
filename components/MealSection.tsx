import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FoodEntry } from '../types';
import FoodCard from './FoodCard';
import Colors from '../constants/Colors';
import { Plus } from 'lucide-react-native';

interface MealSectionProps {
    title: string; // Breakfast, Lunch, etc.
    calories: number;
    foods: FoodEntry[];
    onAddFood: () => void;
    onDeleteFood: (id: string) => void;
}

export default function MealSection({ title, calories, foods, onAddFood, onDeleteFood }: MealSectionProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.calories}>{calories} kcal</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={onAddFood}>
                    <Plus size={20} color="#000" />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {foods.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No food logged</Text>
                </View>
            ) : (
                foods.map((food) => (
                    <FoodCard key={food.id} item={food} onDelete={() => onDeleteFood(food.id)} />
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.neutral[900],
    },
    calories: {
        fontSize: 14,
        color: Colors.neutral[600],
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.accent[500], // Neon lime
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    addButtonText: {
        marginLeft: 4,
        fontWeight: '600',
        fontSize: 14,
        color: '#000',
    },
    emptyState: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    emptyText: {
        color: Colors.neutral[500],
        fontSize: 14,
    },
});
