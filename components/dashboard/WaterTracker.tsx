import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Droplets, Plus } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { hapticFeedback } from '../../utils/haptics';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface WaterTrackerProps {
    intake: number;
    goal?: number;
    onAdd: (amount: number) => void;
}

export function WaterTracker({ intake, goal = 2000, onAdd }: WaterTrackerProps) {
    const progress = Math.min(intake / goal, 1);
    const fillHeight = useSharedValue(0);

    useEffect(() => {
        fillHeight.value = withSpring(progress * 100, { damping: 15 });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => ({
        height: fillHeight.value,
        y: 100 - fillHeight.value,
    }));

    const handleAdd = (amount: number) => {
        hapticFeedback.light();
        onAdd(amount);
    };

    const glassSize = 80;

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Droplets size={20} color="#2196F3" fill="#2196F3" />
                    <Text style={styles.title}>Water Intake</Text>
                </View>
                <Text style={styles.progress}>
                    {intake} <Text style={styles.unit}>/ {goal} ml</Text>
                </Text>
            </View>

            <View style={styles.content}>
                {/* Animated Glass */}
                <View style={styles.glassContainer}>
                    <Svg width={glassSize} height={100} viewBox="0 0 80 100">
                        <Defs>
                            <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor="#4FC3F7" stopOpacity="1" />
                                <Stop offset="1" stopColor="#0288D1" stopOpacity="1" />
                            </LinearGradient>
                            <ClipPath id="glassClip">
                                <Rect x="5" y="0" width="70" height="100" rx="8" />
                            </ClipPath>
                        </Defs>

                        {/* Glass outline */}
                        <Rect
                            x="5"
                            y="0"
                            width="70"
                            height="100"
                            rx="8"
                            fill="none"
                            stroke="#B3E5FC"
                            strokeWidth="3"
                        />

                        {/* Water fill */}
                        <AnimatedRect
                            x="5"
                            width="70"
                            rx="6"
                            fill="url(#waterGrad)"
                            clipPath="url(#glassClip)"
                            animatedProps={animatedProps}
                        />
                    </Svg>

                    {/* Percentage overlay */}
                    <View style={styles.percentOverlay}>
                        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
                    </View>
                </View>

                {/* Quick Add Buttons */}
                <View style={styles.buttons}>
                    <Pressable
                        style={styles.addButton}
                        onPress={() => handleAdd(250)}
                    >
                        <Plus size={14} color="#FFF" />
                        <Text style={styles.buttonText}>250ml</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.addButton, styles.largeButton]}
                        onPress={() => handleAdd(500)}
                    >
                        <Plus size={14} color="#FFF" />
                        <Text style={styles.buttonText}>500ml</Text>
                    </Pressable>
                </View>
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: Colors.primary[800],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.neutral[800],
    },
    progress: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2196F3',
    },
    unit: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.neutral[400],
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    glassContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    percentOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percent: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    buttons: {
        flex: 1,
        gap: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 6,
    },
    largeButton: {
        backgroundColor: '#0288D1',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
});
