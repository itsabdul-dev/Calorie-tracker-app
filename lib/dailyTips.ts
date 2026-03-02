import { DailyStats } from '../types';
import { UserGoals } from '../types';

export interface DailyTip {
    title: string;
    body: string;
    emoji: string;
}

export function generatePersonalizedTip(stats?: DailyStats, goals?: UserGoals): DailyTip {
    const tips: DailyTip[] = [];

    // Calorie-based tips
    if (stats && stats.caloriesGoal > 0) {
        const caloriePercent = (stats.calories / stats.caloriesGoal) * 100;

        if (caloriePercent < 50) {
            tips.push({
                title: "Time for a healthy meal!",
                body: `You've only consumed ${Math.round(caloriePercent)}% of your daily calories. Consider a balanced meal.`,
                emoji: "🍽️"
            });
        } else if (caloriePercent >= 90 && caloriePercent < 100) {
            tips.push({
                title: "Almost at your goal!",
                body: "You're close to your calorie target. Great job staying on track!",
                emoji: "🎯"
            });
        } else if (caloriePercent >= 100) {
            tips.push({
                title: "Goal reached!",
                body: "You've hit your calorie goal. Focus on light activities if you eat more.",
                emoji: "✅"
            });
        }
    }

    // Protein-based tips
    if (stats && goals && goals.protein_goal > 0) {
        const proteinRemaining = goals.protein_goal - stats.protein;

        if (proteinRemaining > 30) {
            tips.push({
                title: "Protein boost needed!",
                body: `You're ${proteinRemaining}g short on protein. Try eggs, chicken, or Greek yogurt.`,
                emoji: "💪"
            });
        }
    }

    // Hydration reminder (generic)
    tips.push({
        title: "Stay hydrated!",
        body: "Remember to drink water throughout the day. Aim for 8 glasses.",
        emoji: "💧"
    });

    // Balanced meals
    tips.push({
        title: "Balance is key",
        body: "Try to include protein, healthy fats, and fiber in every meal.",
        emoji: "⚖️"
    });

    // Snacking tip
    tips.push({
        title: "Smart snacking",
        body: "Choose nuts, fruits, or veggies over processed snacks.",
        emoji: "🥜"
    });

    // Meal timing
    tips.push({
        title: "Don't skip meals",
        body: "Eating regular meals helps maintain steady energy levels.",
        emoji: "⏰"
    });

    // Pick a random tip from the relevant ones
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
}

export function getMorningTip(): DailyTip {
    const morningTips: DailyTip[] = [
        {
            title: "Good morning! ☀️",
            body: "Start your day with a protein-rich breakfast to stay full longer.",
            emoji: "🍳"
        },
        {
            title: "Rise and fuel!",
            body: "Don't skip breakfast - it kickstarts your metabolism.",
            emoji: "🌅"
        },
        {
            title: "New day, new goals!",
            body: "Log your breakfast to start tracking early.",
            emoji: "📝"
        },
    ];

    return morningTips[Math.floor(Math.random() * morningTips.length)];
}

export function getEveningTip(stats?: DailyStats): DailyTip {
    if (stats && stats.calories === 0) {
        return {
            title: "Don't forget to log!",
            body: "You haven't logged any food today. Track to stay on target.",
            emoji: "📊"
        };
    }

    const eveningTips: DailyTip[] = [
        {
            title: "Winding down",
            body: "Try to stop eating 2-3 hours before bed for better sleep.",
            emoji: "🌙"
        },
        {
            title: "Reflect on today",
            body: "How did your eating go today? Tomorrow is a fresh start!",
            emoji: "💭"
        },
    ];

    return eveningTips[Math.floor(Math.random() * eveningTips.length)];
}
