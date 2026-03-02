import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ProfileStats {
    mealsLogged: number;
    daysActive: number;
    goalsMet: number;
}

export function useProfileStats() {
    const { session } = useAuth();
    const [stats, setStats] = useState<ProfileStats>({
        mealsLogged: 0,
        daysActive: 0,
        goalsMet: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        if (!session?.user) return;
        setLoading(true);

        try {
            // Count total meals logged
            const { count: mealsCount } = await supabase
                .from('food_entries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);

            // Count unique days with entries
            const { data: daysData } = await supabase
                .from('food_entries')
                .select('date')
                .eq('user_id', session.user.id);

            const uniqueDays = new Set(daysData?.map(d => d.date) || []);

            setStats({
                mealsLogged: mealsCount || 0,
                daysActive: uniqueDays.size,
                goalsMet: Math.floor((mealsCount || 0) / 3), // Rough estimate: 3 meals = 1 day on target
            });
        } catch (error) {
            console.error('Error fetching profile stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [session]);

    return { stats, loading, refresh: fetchStats };
}
