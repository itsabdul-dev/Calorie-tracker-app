import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Check } from 'lucide-react-native';
import { Colors, Typography } from '../constants';
import { hapticFeedback } from '../utils/haptics';

export function AddFoodSuccess({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
    React.useEffect(() => {
        if (visible) {
            hapticFeedback.success();
            setTimeout(onComplete, 1500);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade">
            <View style={styles.container}>
                <MotiView
                    from={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    style={styles.content}
                >
                    <MotiView
                        from={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 100, damping: 12 }}
                        style={styles.iconContainer}
                    >
                        <Check size={32} color={Colors.neutral[0]} strokeWidth={3} />
                    </MotiView>
                    <Text style={styles.text}>Food Added!</Text>
                </MotiView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.overlay.medium,
    },
    content: {
        backgroundColor: Colors.neutral[0],
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: Colors.shadow.heavy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    text: {
        ...Typography.h3,
        color: Colors.neutral[900],
    },
});
