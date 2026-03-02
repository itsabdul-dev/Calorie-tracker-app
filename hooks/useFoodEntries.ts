import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FoodEntry, DailyStats } from '../types';

export const useFoodEntries = (date: string) => {
    const { session, profile } = useAuth();
    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DailyStats>({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        caloriesGoal: 2000,
    });

    // Update stats goal when profile changes
    useEffect(() => {
        if (profile?.daily_calorie_goal) {
            setStats(prev => ({ ...prev, caloriesGoal: profile.daily_calorie_goal }));
        }
    }, [profile]);

    const fetchEntries = async () => {
        if (!session?.user || !date) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('food_entries')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('date', date);

        if (error) {
            console.error('Error fetching food entries:', error);
        } else {
            setEntries(data || []);
            calculateStats(data || []);
        }
        setLoading(false);
    };

    const calculateStats = (data: FoodEntry[]) => {
        const consumed = data.reduce(
            (acc, entry) => ({
                calories: acc.calories + (entry.calories || 0),
                protein: acc.protein + Number(entry.protein || 0),
                carbs: acc.carbs + Number(entry.carbs || 0),
                fat: acc.fat + Number(entry.fat || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        setStats(prev => ({
            ...prev,
            calories: consumed.calories,
            protein: consumed.protein,
            carbs: consumed.carbs,
            fat: consumed.fat,
        }));
    };

    const addEntry = async (entry: Omit<FoodEntry, 'id' | 'user_id' | 'created_at' | 'open_food_facts_id' | 'date' | 'barcode'> & { open_food_facts_id?: string; barcode?: string | null }) => {
        if (!session?.user) return;

        const { data, error } = await supabase.from('food_entries').insert({
            ...entry,
            user_id: session.user.id,
            date: date,
        }).select().single();

        if (error) {
            console.error('Error adding entry:', error);
            throw error;
        }

        const newEntries = [...entries, data];
        setEntries(newEntries);
        calculateStats(newEntries);
        return data;
    };

    const deleteEntry = async (id: string) => {
        // Optimistic update
        const previousEntries = [...entries];
        const newEntries = entries.filter(e => e.id !== id);
        setEntries(newEntries);
        calculateStats(newEntries);

        const { error } = await supabase.from('food_entries').delete().eq('id', id);

        if (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'Failed to delete entry');
            // Revert on error
            setEntries(previousEntries);
            calculateStats(previousEntries);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [date, session]);

    return { entries, stats, loading, addEntry, deleteEntry, refresh: fetchEntries };
};
