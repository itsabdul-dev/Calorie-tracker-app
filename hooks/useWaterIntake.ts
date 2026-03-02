import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface WaterIntake {
    id?: string;
    amount: number;
    date: string;
}

export function useWaterIntake(date?: string) {
    const { session } = useAuth();
    const [intake, setIntake] = useState(0);
    const [loading, setLoading] = useState(true);
    const currentDate = date || format(new Date(), 'yyyy-MM-dd');

    const fetchIntake = async () => {
        if (!session?.user) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('water_intake')
                .select('amount')
                .eq('user_id', session.user.id)
                .eq('date', currentDate)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching water intake:', error);
            }

            setIntake(data?.amount || 0);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addWater = async (amount: number) => {
        if (!session?.user) return;

        const newAmount = intake + amount;
        setIntake(newAmount); // Optimistic update

        try {
            // Upsert - create or update
            const { error } = await supabase
                .from('water_intake')
                .upsert({
                    user_id: session.user.id,
                    date: currentDate,
                    amount: newAmount,
                }, {
                    onConflict: 'user_id,date',
                });

            if (error) {
                console.error('Error updating water intake:', error);
                setIntake(intake); // Revert on error
            }
        } catch (error) {
            console.error('Error:', error);
            setIntake(intake);
        }
    };

    const resetWater = async () => {
        if (!session?.user) return;

        setIntake(0);

        try {
            await supabase
                .from('water_intake')
                .delete()
                .eq('user_id', session.user.id)
                .eq('date', currentDate);
        } catch (error) {
            console.error('Error resetting water:', error);
        }
    };

    useEffect(() => {
        fetchIntake();
    }, [session, currentDate]);

    return {
        intake,
        loading,
        addWater,
        resetWater,
        refresh: fetchIntake,
    };
}
