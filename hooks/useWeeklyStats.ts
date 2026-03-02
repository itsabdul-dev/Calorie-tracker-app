import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { startOfWeek, endOfWeek, subDays, format, eachDayOfInterval } from 'date-fns';

export interface DailyStat {
    date: string;
    dayLabel: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export const useWeeklyStats = () => {
    const { session, profile } = useAuth();
    const [weeklyData, setWeeklyData] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageCalories, setAverageCalories] = useState(0);

    // New Stats
    const [avgMacros, setAvgMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
    const [daysOnTarget, setDaysOnTarget] = useState(0);

    const fetchWeeklyStats = async () => {
        if (!session?.user) return;
        setLoading(true);

        // Get last 7 days including today
        const end = new Date();
        const start = subDays(end, 6);

        const startDate = format(start, 'yyyy-MM-dd');
        const endDate = format(end, 'yyyy-MM-dd');

        // Fetch data
        const { data, error } = await supabase
            .from('food_entries')
            .select('date, calories, protein, carbs, fat')
            .eq('user_id', session.user.id)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) {
            console.error('Error fetching weekly stats:', error);
            setLoading(false);
            return;
        }

        // Initialize empty stats for last 7 days
        const daysInterval = eachDayOfInterval({ start, end });
        const statsMap = new Map<string, DailyStat>();

        daysInterval.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            statsMap.set(dateStr, {
                date: dateStr,
                dayLabel: format(day, 'EEE'), // Mon, Tue...
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
            });
        });

        // Aggregate data
        data?.forEach((entry: any) => {
            const stat = statsMap.get(entry.date);
            if (stat) {
                stat.calories += entry.calories || 0;
                stat.protein += Number(entry.protein) || 0;
                stat.carbs += Number(entry.carbs) || 0;
                stat.fat += Number(entry.fat) || 0;
            }
        });

        const result = Array.from(statsMap.values());
        setWeeklyData(result);

        // Calculate averages
        const totals = result.reduce((acc, curr) => ({
            calories: acc.calories + curr.calories,
            protein: acc.protein + curr.protein,
            carbs: acc.carbs + curr.carbs,
            fat: acc.fat + curr.fat,
            daysOnTarget: acc.daysOnTarget + (
                profile?.daily_calorie_goal &&
                    curr.calories > 0 &&
                    curr.calories <= (profile.daily_calorie_goal * 1.1)
                    ? 1 : 0
            )
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, daysOnTarget: 0 });

        const daysWithData = result.filter(d => d.calories > 0).length || 1; // Avoid divide by zero

        setAverageCalories(Math.round(totals.calories / 7)); // Avg per day over the week
        setAvgMacros({
            protein: Math.round(totals.protein / daysWithData),
            carbs: Math.round(totals.carbs / daysWithData),
            fat: Math.round(totals.fat / daysWithData)
        });
        setDaysOnTarget(totals.daysOnTarget);

        setLoading(false);
    };

    useEffect(() => {
        fetchWeeklyStats();
    }, [session, profile]);

    return {
        weeklyData,
        loading,
        averageCalories,
        avgMacros,
        daysOnTarget,
        totalCalories: weeklyData.reduce((sum, d) => sum + d.calories, 0),
        refresh: fetchWeeklyStats
    };
};
