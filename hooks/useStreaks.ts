import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserStreak } from '../types';
import { format, differenceInDays, parseISO } from 'date-fns';

export const useStreaks = () => {
    const { session } = useAuth();
    const [streak, setStreak] = useState<UserStreak | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStreak = async () => {
        if (!session?.user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching streak:', error);
        } else {
            setStreak(data);
        }
        setLoading(false);
    };

    const updateStreak = useCallback(async () => {
        if (!session?.user) return;

        const today = format(new Date(), 'yyyy-MM-dd');

        // Check if user logged food today
        const { data: entries, error: entriesError } = await supabase
            .from('food_entries')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('date', today)
            .limit(1);

        if (entriesError) {
            console.error('Error checking entries:', entriesError);
            return;
        }

        if (!entries || entries.length === 0) {
            // No food logged today, don't update streak
            return;
        }

        // Get current streak data
        const { data: currentStreak, error: streakError } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        let newStreak = 1;
        let bestStreak = 1;

        if (currentStreak && !streakError) {
            const lastLogged = currentStreak.last_logged_date;

            if (lastLogged === today) {
                // Already updated today
                return;
            }

            if (lastLogged) {
                const daysDiff = differenceInDays(new Date(today), parseISO(lastLogged));

                if (daysDiff === 1) {
                    // Consecutive day - increment streak
                    newStreak = currentStreak.current_streak + 1;
                } else if (daysDiff > 1) {
                    // Streak broken - reset to 1
                    newStreak = 1;
                }
            }

            bestStreak = Math.max(newStreak, currentStreak.best_streak || 0);
        }

        const { data, error } = await supabase
            .from('user_streaks')
            .upsert({
                user_id: session.user.id,
                current_streak: newStreak,
                best_streak: bestStreak,
                last_logged_date: today,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            console.error('Error updating streak:', error);
        } else {
            setStreak(data);
        }
    }, [session]);

    useEffect(() => {
        fetchStreak();
    }, [session]);

    return { streak, loading, updateStreak, refetch: fetchStreak };
};
