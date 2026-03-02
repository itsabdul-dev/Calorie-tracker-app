import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Flame, Quote } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { getDailyQuote } from '../../lib/motivationalQuotes';

interface StreakBannerProps {
    streak: number;
}

export function StreakBanner({ streak }: StreakBannerProps) {
    const { quote, author } = getDailyQuote();

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.container}
        >
            <LinearGradient
                colors={streak >= 7 ? ['#FF6B6B', '#FF8E53'] : ['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Streak Display */}
                    <View style={styles.streakSection}>
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                                type: 'timing',
                                duration: 1500,
                                loop: true,
                                repeatReverse: true,
                            }}
                            style={styles.flameContainer}
                        >
                            <Flame size={28} color="#FFF" fill="#FFEB3B" />
                        </MotiView>
                        <View style={styles.streakInfo}>
                            <Text style={styles.streakNumber}>{streak}</Text>
                            <Text style={styles.streakLabel}>day streak</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Quote */}
                    <View style={styles.quoteSection}>
                        <Quote size={14} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.quote} numberOfLines={2}>
                            {quote}
                        </Text>
                        <Text style={styles.author}>— {author}</Text>
                    </View>
                </View>
            </LinearGradient>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    gradient: {
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    flameContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakInfo: {
        alignItems: 'flex-start',
    },
    streakNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFF',
        lineHeight: 32,
    },
    streakLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 16,
    },
    quoteSection: {
        flex: 1,
    },
    quote: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFF',
        fontStyle: 'italic',
        lineHeight: 18,
        marginTop: 4,
    },
    author: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
});
