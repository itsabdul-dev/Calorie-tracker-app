// Stats insights generation logic

interface WeeklyData {
    day: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface Insight {
    type: 'tip' | 'improvement' | 'warning' | 'celebration';
    title: string;
    message: string;
}

export function generateInsights(
    currentWeek: WeeklyData[],
    previousWeek: WeeklyData[],
    goal: number
): Insight[] {
    const insights: Insight[] = [];

    // Calculate averages
    const currentAvg = currentWeek.reduce((sum, d) => sum + d.calories, 0) / 7;
    const prevAvg = previousWeek.length > 0
        ? previousWeek.reduce((sum, d) => sum + d.calories, 0) / 7
        : 0;

    // Weekend vs Weekday analysis
    const weekdayAvg = currentWeek.slice(0, 5).reduce((sum, d) => sum + d.calories, 0) / 5;
    const weekendAvg = currentWeek.slice(5).reduce((sum, d) => sum + d.calories, 0) / 2;
    const weekendDiff = Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100);

    if (weekendDiff > 20) {
        insights.push({
            type: 'tip',
            title: 'Weekend Pattern Detected',
            message: `You eat ${weekendDiff}% more on weekends. Try planning meals ahead!`,
        });
    }

    // Week over week comparison
    if (prevAvg > 0) {
        const weekChange = Math.round(((currentAvg - prevAvg) / prevAvg) * 100);
        if (weekChange < -10) {
            insights.push({
                type: 'celebration',
                title: 'Great Progress! 🎉',
                message: `You're eating ${Math.abs(weekChange)}% less than last week. Keep it up!`,
            });
        } else if (weekChange > 15) {
            insights.push({
                type: 'warning',
                title: 'Calorie Increase',
                message: `Your intake is ${weekChange}% higher than last week. Consider reviewing your portions.`,
            });
        }
    }

    // Goal achievement check
    const daysOnTarget = currentWeek.filter(d => d.calories <= goal * 1.1 && d.calories >= goal * 0.9).length;
    if (daysOnTarget >= 5) {
        insights.push({
            type: 'celebration',
            title: 'Consistency Champion! 🏆',
            message: `${daysOnTarget} out of 7 days on target. You're crushing it!`,
        });
    } else if (daysOnTarget <= 2) {
        insights.push({
            type: 'improvement',
            title: 'Room to Improve',
            message: `Only ${daysOnTarget} days on target. Focus on hitting your daily goal more consistently.`,
        });
    }

    // Protein check
    const avgProtein = currentWeek.reduce((sum, d) => sum + d.protein, 0) / 7;
    if (avgProtein < 100) {
        insights.push({
            type: 'tip',
            title: 'Boost Your Protein 💪',
            message: `Averaging ${Math.round(avgProtein)}g protein/day. Aim for 100g+ for muscle health.`,
        });
    }

    // Low day detection
    const lowestDay = [...currentWeek].sort((a, b) => a.calories - b.calories)[0];
    if (lowestDay.calories < goal * 0.6) {
        insights.push({
            type: 'warning',
            title: 'Very Low Intake Day',
            message: `${lowestDay.day} was very low at ${lowestDay.calories} cal. Make sure you're eating enough!`,
        });
    }

    // Return top 3 most relevant insights
    return insights.slice(0, 3);
}

export function calculatePersonalBests(data: WeeklyData[], streak: number = 0) {
    if (data.length === 0) {
        return {
            bestStreak: streak,
            lowestCalorieDay: 0,
            highestCalorieDay: 0,
            mostConsistentWeek: 0,
        };
    }

    const calories = data.map(d => d.calories).filter(c => c > 0);

    return {
        bestStreak: streak,
        lowestCalorieDay: Math.min(...calories) || 0,
        highestCalorieDay: Math.max(...calories) || 0,
        mostConsistentWeek: data.filter(d => d.calories > 0).length,
    };
}

export function getComparisonData(current: number, previous: number) {
    if (previous === 0) return { change: 0, isPositive: true };
    const change = Math.round(((current - previous) / previous) * 100);
    return { change, isPositive: change <= 0 };
}
