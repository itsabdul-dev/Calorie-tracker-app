import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import Colors from '../../constants/Colors';

interface AvatarFrameProps {
    avatarUrl: string | null;
    streak: number;
    size?: number;
    uploading?: boolean;
}

export function AvatarFrame({ avatarUrl, streak, size = 110, uploading = false }: AvatarFrameProps) {
    // Calculate frame intensity based on streak
    const getFrameColors = (): [string, string, string] => {
        if (streak >= 30) return ['#FFD700', '#FF8C00', '#FF4500']; // Gold/Fire for 30+
        if (streak >= 14) return ['#E040FB', '#7C4DFF', '#536DFE']; // Purple for 14+
        if (streak >= 7) return ['#00E676', '#00BFA5', '#1DE9B6'];  // Green for 7+
        if (streak >= 3) return ['#64B5F6', '#42A5F5', '#2196F3'];  // Blue for 3+
        return [Colors.neutral[300], Colors.neutral[400], Colors.neutral[300]]; // Default gray
    };

    const frameColors = getFrameColors();
    const frameSize = size + 16;
    const shouldAnimate = streak >= 7;

    return (
        <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                rotate: shouldAnimate ? '360deg' : '0deg',
            }}
            transition={{
                scale: { type: 'spring', delay: 100 },
                rotate: { type: 'timing', duration: 8000, loop: shouldAnimate },
            }}
            style={[styles.frameContainer, { width: frameSize, height: frameSize }]}
        >
            <LinearGradient
                colors={frameColors}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={[styles.innerFrame, { width: size + 8, height: size + 8 }]}>
                    <View style={[styles.avatarContainer, { width: size, height: size }]}>
                        {uploading ? (
                            <View style={styles.loadingContainer}>
                                <MotiView
                                    from={{ rotate: '0deg' }}
                                    animate={{ rotate: '360deg' }}
                                    transition={{ type: 'timing', duration: 1000, loop: true }}
                                    style={styles.loader}
                                />
                            </View>
                        ) : avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
                            />
                        ) : (
                            <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
                                <User size={size * 0.4} color={Colors.primary[500]} strokeWidth={2} />
                            </View>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    frameContainer: {
        borderRadius: 100,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        padding: 4,
    },
    innerFrame: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    avatarContainer: {
        borderRadius: 100,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    avatar: {
        resizeMode: 'cover',
    },
    placeholder: {
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: Colors.primary[200],
        borderTopColor: Colors.primary[500],
    },
});
