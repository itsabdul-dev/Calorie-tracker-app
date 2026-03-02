import { Easing } from 'react-native-reanimated';

export const AnimationConfig = {
    // Spring animations (for interactive elements)
    spring: {
        damping: 20,
        stiffness: 90,
        mass: 0.5,
    },

    springBouncy: {
        damping: 12,
        stiffness: 100,
        mass: 0.8,
    },

    // Timing animations
    timing: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease out cubic
    },

    timingFast: {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },

    timingSlow: {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
};

// Preset animation variants
export const fadeIn = {
    from: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { type: 'timing' as const, duration: 300 },
};

export const slideUp = {
    from: { translateY: 20, opacity: 0 },
    animate: { translateY: 0, opacity: 1 },
    transition: { type: 'spring' as const, ...AnimationConfig.spring },
};

export const scaleIn = {
    from: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring' as const, ...AnimationConfig.spring },
};
