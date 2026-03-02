// Gamification system for XP, levels, and achievements

export interface Level {
    level: number;
    name: string;
    minXP: number;
    maxXP: number;
    color: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    requirement: number;
    type: 'meals' | 'streak' | 'days' | 'goal';
    color: string;
    bgColor: string;
}

// XP Constants
const XP_PER_MEAL = 10;
const XP_PER_DAY_STREAK = 25;
const XP_PER_GOAL_MET = 50;

// Level Definitions
export const LEVELS: Level[] = [
    { level: 1, name: 'Beginner', minXP: 0, maxXP: 100, color: '#78909C' },
    { level: 2, name: 'Novice', minXP: 100, maxXP: 300, color: '#26A69A' },
    { level: 3, name: 'Regular', minXP: 300, maxXP: 600, color: '#42A5F5' },
    { level: 4, name: 'Committed', minXP: 600, maxXP: 1000, color: '#7E57C2' },
    { level: 5, name: 'Dedicated', minXP: 1000, maxXP: 1500, color: '#EC407A' },
    { level: 6, name: 'Expert', minXP: 1500, maxXP: 2200, color: '#FF7043' },
    { level: 7, name: 'Master', minXP: 2200, maxXP: 3000, color: '#FFCA28' },
    { level: 8, name: 'Legend', minXP: 3000, maxXP: 4000, color: '#FFD700' },
    { level: 9, name: 'Champion', minXP: 4000, maxXP: 5500, color: '#FF6F00' },
    { level: 10, name: 'Nutrition Guru', minXP: 5500, maxXP: Infinity, color: '#E91E63' },
];

// Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_log',
        title: 'First Steps',
        description: 'Log your first meal',
        icon: '🎯',
        requirement: 1,
        type: 'meals',
        color: '#4CAF50',
        bgColor: '#E8F5E9',
    },
    {
        id: 'meals_10',
        title: 'Getting Started',
        description: 'Log 10 meals',
        icon: '🍽️',
        requirement: 10,
        type: 'meals',
        color: '#2196F3',
        bgColor: '#E3F2FD',
    },
    {
        id: 'meals_50',
        title: 'Consistent Logger',
        description: 'Log 50 meals',
        icon: '📊',
        requirement: 50,
        type: 'meals',
        color: '#9C27B0',
        bgColor: '#F3E5F5',
    },
    {
        id: 'meals_100',
        title: 'Century Club',
        description: 'Log 100 meals',
        icon: '💯',
        requirement: 100,
        type: 'meals',
        color: '#FF9800',
        bgColor: '#FFF3E0',
    },
    {
        id: 'streak_3',
        title: 'On Fire',
        description: '3-day streak',
        icon: '🔥',
        requirement: 3,
        type: 'streak',
        color: '#F44336',
        bgColor: '#FFEBEE',
    },
    {
        id: 'streak_7',
        title: 'Week Warrior',
        description: '7-day streak',
        icon: '⚡',
        requirement: 7,
        type: 'streak',
        color: '#FF5722',
        bgColor: '#FBE9E7',
    },
    {
        id: 'streak_30',
        title: 'Monthly Master',
        description: '30-day streak',
        icon: '🏆',
        requirement: 30,
        type: 'streak',
        color: '#FFD700',
        bgColor: '#FFFDE7',
    },
    {
        id: 'days_7',
        title: 'First Week',
        description: 'Active for 7 days',
        icon: '📅',
        requirement: 7,
        type: 'days',
        color: '#00BCD4',
        bgColor: '#E0F7FA',
    },
    {
        id: 'goal_10',
        title: 'Goal Getter',
        description: 'Meet daily goal 10 times',
        icon: '🎯',
        requirement: 10,
        type: 'goal',
        color: '#8BC34A',
        bgColor: '#F1F8E9',
    },
];

// Calculate total XP from user stats
export function calculateXP(mealsLogged: number, currentStreak: number, daysActive: number): number {
    return (mealsLogged * XP_PER_MEAL) +
        (currentStreak * XP_PER_DAY_STREAK) +
        (daysActive * 5);
}

// Get current level from XP
export function getLevel(xp: number): Level {
    return LEVELS.find(l => xp >= l.minXP && xp < l.maxXP) || LEVELS[LEVELS.length - 1];
}

// Get progress to next level (0-1)
export function getLevelProgress(xp: number): number {
    const level = getLevel(xp);
    if (level.maxXP === Infinity) return 1;
    const progressInLevel = xp - level.minXP;
    const levelRange = level.maxXP - level.minXP;
    return progressInLevel / levelRange;
}

// Get XP needed for next level
export function getXPToNextLevel(xp: number): number {
    const level = getLevel(xp);
    if (level.maxXP === Infinity) return 0;
    return level.maxXP - xp;
}

// Check which achievements are unlocked
export function getUnlockedAchievements(
    mealsLogged: number,
    currentStreak: number,
    daysActive: number,
    goalsMet: number
): Achievement[] {
    return ACHIEVEMENTS.filter(achievement => {
        switch (achievement.type) {
            case 'meals':
                return mealsLogged >= achievement.requirement;
            case 'streak':
                return currentStreak >= achievement.requirement;
            case 'days':
                return daysActive >= achievement.requirement;
            case 'goal':
                return goalsMet >= achievement.requirement;
            default:
                return false;
        }
    });
}

// Get next achievement to unlock for each type
export function getNextAchievements(
    mealsLogged: number,
    currentStreak: number,
    daysActive: number,
    goalsMet: number
): Achievement[] {
    const types = ['meals', 'streak', 'days', 'goal'] as const;
    const getValue = (type: typeof types[number]) => {
        switch (type) {
            case 'meals': return mealsLogged;
            case 'streak': return currentStreak;
            case 'days': return daysActive;
            case 'goal': return goalsMet;
        }
    };

    return types.map(type => {
        const typeAchievements = ACHIEVEMENTS.filter(a => a.type === type);
        const currentValue = getValue(type);
        return typeAchievements.find(a => currentValue < a.requirement);
    }).filter(Boolean) as Achievement[];
}
