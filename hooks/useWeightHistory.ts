import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export interface WeightLog {
    id: string;
    weight: number;
    date: string;
}

export const useWeightHistory = () => {
    const { session } = useAuth();
    const [weights, setWeights] = useState<WeightLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWeights = async () => {
        if (!session?.user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('weight_logs')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: true })
            .limit(30); // Last 30 entries

        if (error) {
            console.error('Error fetching weights:', error);
        } else {
            setWeights(data || []);
        }
        setLoading(false);
    };

    const addWeight = async (weight: number, date: string = new Date().toISOString().split('T')[0]) => {
        if (!session?.user) return;

        const { data, error } = await supabase
            .from('weight_logs')
            .upsert({
                user_id: session.user.id,
                weight,
                date
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding weight:', error);
            throw error;
        }

        fetchWeights(); // Refresh
        return data;
    };

    useEffect(() => {
        fetchWeights();
    }, [session]);

    return { weights, loading, addWeight, refresh: fetchWeights };
};
