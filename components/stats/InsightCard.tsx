import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';

interface InsightCardProps {
    type: 'tip' | 'improvement' | 'warning' | 'celebration';
    title: string;
    message: string;
    delay?: number;
}

export function InsightCard({ type, title, message, delay = 300 }: InsightCardProps) {
    const config = {
        tip: {
            colors: [Colors.primary[500], Colors.primary[600]] as [string, string],
            icon: <Lightbulb size={20} color="#FFF" />,
            iconBg: 'rgba(255,255,255,0.2)',
        },
        improvement: {
            colors: ['#2196F3', '#1976D2'] as [string, string],
            icon: <TrendingUp size={20} color="#FFF" />,
            iconBg: 'rgba(255,255,255,0.2)',
        },
        warning: {
            colors: ['#FF9800', '#F57C00'] as [string, string],
            icon: <AlertCircle size={20} color="#FFF" />,
            iconBg: 'rgba(255,255,255,0.2)',
        },
        celebration: {
            colors: ['#9C27B0', '#7B1FA2'] as [string, string],
            icon: <TrendingUp size={20} color="#FFF" />,
            iconBg: 'rgba(255,255,255,0.2)',
        },
    };

    const { colors, icon, iconBg } = config[type];

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ delay }}
            style={styles.container}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                    {icon}
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                </View>
            </LinearGradient>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 18,
    },
});
