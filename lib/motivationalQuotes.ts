// Motivational quotes for the streak banner

export const MOTIVATIONAL_QUOTES = [
    { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { quote: "Your body hears everything your mind says.", author: "Naomi Judd" },
    { quote: "Eat breakfast like a king, lunch like a prince, dinner like a pauper.", author: "Adelle Davis" },
    { quote: "Let food be thy medicine and medicine be thy food.", author: "Hippocrates" },
    { quote: "You don't have to eat less, you just have to eat right.", author: "Unknown" },
    { quote: "Small progress is still progress.", author: "Unknown" },
    { quote: "The groundwork for all happiness is health.", author: "Leigh Hunt" },
    { quote: "Moderation. Small helpings. No seconds.", author: "Adelle Davis" },
    { quote: "It's not about being the best. It's about being better than yesterday.", author: "Unknown" },
    { quote: "Drink water like it's your job.", author: "Unknown" },
    { quote: "Every meal is a chance to nourish your body.", author: "Unknown" },
    { quote: "Consistency is what transforms average into excellence.", author: "Unknown" },
    { quote: "Your diet is a bank account. Good choices are good investments.", author: "Bethenny Frankel" },
    { quote: "Don't dig your grave with your own knife and fork.", author: "English Proverb" },
    { quote: "Healthy eating is a form of self-respect.", author: "Unknown" },
    { quote: "One cannot think well, love well, sleep well, if one has not dined well.", author: "Virginia Woolf" },
    { quote: "The food you eat can be either the safest medicine or the slowest poison.", author: "Ann Wigmore" },
    { quote: "Today's choices are tomorrow's body.", author: "Unknown" },
    { quote: "You are what you eat, so don't be fast, cheap, easy, or fake.", author: "Unknown" },
];

// Get quote based on day of year for consistency
export function getDailyQuote(): { quote: string; author: string } {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}
