import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserGoals } from '../types';

export const useGoals = () => {
    const { session } = useAuth();
    const [goals, setGoals] = useState<UserGoals | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchGoals = async () => {
        if (!session?.user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('user_goals')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching goals:', error);
        } else {
            setGoals(data);
        }
        setLoading(false);
    };

    const updateGoals = async (newGoals: Partial<Pick<UserGoals, 'protein_goal' | 'carbs_goal' | 'fat_goal'>>) => {
        if (!session?.user) return;

        const { data, error } = await supabase
            .from('user_goals')
            .upsert({
                user_id: session.user.id,
                ...newGoals,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            console.error('Error updating goals:', error);
            throw error;
        }

        setGoals(data);
        return data;
    };

    useEffect(() => {
        fetchGoals();
    }, [session]);

    return { goals, loading, updateGoals, refetch: fetchGoals };
};
