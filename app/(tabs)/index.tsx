import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Alert, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { ChevronLeft, ChevronRight, Plus, Trash2, Zap, Flame, Droplet, Coffee, Sun, Moon, Sunset, Utensils, TrendingUp } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  useAnimatedStyle
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useFoodEntries } from '../../hooks/useFoodEntries';
import { useStreaks } from '../../hooks/useStreaks';
import { useWaterIntake } from '../../hooks/useWaterIntake';
import { format, addDays } from 'date-fns';
import { useRouter, useFocusEffect } from 'expo-router';
import { hapticFeedback } from '../../utils/haptics';
import { useCallback } from 'react';
import { BlurView } from 'expo-blur';
import Colors from '../../constants/Colors';
import { WaterTracker, StreakBanner } from '../../components/dashboard';

const { width } = Dimensions.get('window');

// --- Subcomponents ---

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ProgressRing({ progress, size, strokeWidth, children }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 1500 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progressValue.value * circumference);
    return { strokeDashoffset };
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={Colors.accent[500]} stopOpacity="1" />
            <Stop offset="1" stopColor={Colors.primary[500]} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)" // Use the gradient definition
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', transform: [{ rotate: '0deg' }] }}>
        {children}
      </View>
    </View>
  );
}

function StatCard({ label, value, unit, icon: Icon, color, delay }: any) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay }}
      style={styles.statCard}
    >
      <BlurView intensity={80} tint="light" style={styles.statCardBlur}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}25` }]}>
          <Icon size={22} color={color} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={[styles.statValue, { color }]}>{Math.round(value)}<Text style={styles.statUnit}>{unit}</Text></Text>
        </View>
      </BlurView>
    </MotiView>
  )
}



function FoodItem({ name, calories, serving, onDelete, delay }: any) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', delay }}
      style={styles.foodItem}
    >
      <View style={styles.foodIconPlaceholder}>
        <Utensils size={16} color="#455A64" />
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{name}</Text>
        <Text style={styles.foodServing}>
          {calories} kcal • {serving}
        </Text>
      </View>
      <Pressable onPress={onDelete} style={styles.deleteButton}>
        <Trash2 size={16} color="#FF5252" />
      </Pressable>
    </MotiView>
  );
}

function MealSection({ title, calories, items, onAdd, icon: Icon, delay, onDeleteItem }: any) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay }}
      style={styles.mealSection}
    >
      <LinearGradient
        colors={Colors.gradients.card as any}
        style={styles.mealCard}
      >
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleRow}>
            <View style={styles.mealIconParams}>
              <Icon size={18} color={Colors.primary[700]} />
            </View>
            <Text style={styles.mealTitle}>{title}</Text>
          </View>
          <View style={styles.mealActions}>
            <Text style={styles.mealCalories}>{Math.round(calories)} kcal</Text>
            <Pressable style={styles.addButton} onPress={onAdd}>
              <Plus size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No food added yet</Text>
          </View>
        ) : (
          <View style={styles.foodList}>
            {items.map((item: any, i: number) => (
              <FoodItem
                key={item.id}
                {...item}
                name={item.food_name}
                serving={item.serving_size || '1 serving'}
                onDelete={() => onDeleteItem(item.id)}
                delay={delay + 100 + (i * 50)}
              />
            ))}
          </View>
        )}
      </LinearGradient>
    </MotiView>
  )
}


// --- Main Screen ---

export default function DashboardScreen() {
  const { session, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const { entries, loading: entriesLoading, stats, deleteEntry, refresh } = useFoodEntries(dateStr);
  const { streak } = useStreaks();
  const { intake: waterIntake, addWater } = useWaterIntake(dateStr);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const changeDate = (days: number) => {
    hapticFeedback.selection();
    setCurrentDate(prev => addDays(prev, days));
  };

  const handleAddFood = (meal: string) => {
    hapticFeedback.light();
    router.push({
      pathname: '/add',
      params: { meal, date: dateStr }
    });
  };

  const handleDelete = (id: string) => {
    hapticFeedback.warning();
    Alert.alert(
      "Delete Entry",
      "Remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => { deleteEntry(id); hapticFeedback.medium(); } }
      ]
    );
  };

  const calorieGoal = stats.caloriesGoal || 2000;
  const caloriesConsumed = stats.calories || 0;
  const progress = Math.min(caloriesConsumed / calorieGoal, 1);

  const getMeals = (type: string) => entries.filter(e => e.meal_type === type);

  if (authLoading) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={Colors.gradients.hero as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          >
            <ImageBackground
              source={{ uri: 'https://img.freepik.com/free-vector/white-abstract-background_23-2148810113.jpg' }} // Subtle pattern overlay if needed, or remove
              style={{ flex: 1, opacity: 0.1 }}
              resizeMode="cover"
            />
          </LinearGradient>

          <View style={styles.heroContent}>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || 'User'}</Text>
                <Text style={styles.subGreeting}>Let's crush it today! 🔥</Text>
              </View>
              <View style={styles.dateBadge}>
                <Pressable onPress={() => changeDate(-1)} hitSlop={10}>
                  <ChevronLeft size={16} color="rgba(255,255,255,0.7)" />
                </Pressable>
                <Text style={styles.dateText}>{format(currentDate, 'MMM d')}</Text>
                <Pressable onPress={() => changeDate(1)} hitSlop={10}>
                  <ChevronRight size={16} color="rgba(255,255,255,0.7)" />
                </Pressable>
              </View>
            </View>

            {/* Main Progress - Centered */}
            <View style={styles.progressWrapper}>
              <ProgressRing progress={progress} size={220} strokeWidth={18}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.ringValue}>{Math.round(caloriesConsumed)}</Text>
                  <Text style={styles.ringLabel}>calories</Text>
                  <View style={styles.ringDivider} />
                  <Text style={styles.ringSub}>{Math.round(calorieGoal - caloriesConsumed)} left</Text>
                </View>
              </ProgressRing>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <StatCard
                label="Protein"
                value={stats.protein}
                unit="g"
                icon={Zap}
                color={Colors.macros.protein}
                delay={600}
              />
              <StatCard
                label="Carbs"
                value={stats.carbs}
                unit="g"
                icon={TrendingUp} // Placeholder for carbs visual if needed
                color={Colors.macros.carbs}
                delay={700}
              />
              <StatCard
                label="Fat"
                value={stats.fat}
                unit="g"
                icon={Droplet}
                color={Colors.macros.fat}
                delay={800}
              />
            </View>
          </View>
        </View>

        {/* Streak & Motivation Banner */}
        {streak && streak.current_streak > 0 && (
          <StreakBanner streak={streak.current_streak} />
        )}

        {/* Water Tracker Widget */}
        <WaterTracker
          intake={waterIntake}
          goal={2000}
          onAdd={addWater}
        />

        {/* MEALS LIST */}
        <View style={styles.mealsContainer}>
          <MealSection
            title="Breakfast"
            icon={Coffee}
            calories={getMeals('breakfast').reduce((a, b) => a + b.calories, 0)}
            items={getMeals('breakfast')}
            onAdd={() => handleAddFood('breakfast')}
            delay={900}
            onDeleteItem={handleDelete}
          />
          <MealSection
            title="Lunch"
            icon={Sun}
            calories={getMeals('lunch').reduce((a, b) => a + b.calories, 0)}
            items={getMeals('lunch')}
            onAdd={() => handleAddFood('lunch')}
            delay={1000}
            onDeleteItem={handleDelete}
          />
          <MealSection
            title="Dinner"
            icon={Sunset} // Or Moon
            calories={getMeals('dinner').reduce((a, b) => a + b.calories, 0)}
            items={getMeals('dinner')}
            onAdd={() => handleAddFood('dinner')}
            delay={1100}
            onDeleteItem={handleDelete}
          />
          <MealSection
            title="Snack"
            icon={Utensils}
            calories={getMeals('snack').reduce((a, b) => a + b.calories, 0)}
            items={getMeals('snack')}
            onAdd={() => handleAddFood('snack')}
            delay={1200}
            onDeleteItem={handleDelete}
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  heroContainer: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#1B5E20', // Fallback
    elevation: 10,
    shadowColor: Colors.primary[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  dateText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  progressWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  ringValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ringLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -4,
  },
  ringDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 8,
  },
  ringSub: {
    fontSize: 16,
    color: Colors.accent[500],
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 110,
  },
  statCardBlur: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  statUnit: {
    fontSize: 12,
    color: '#90A4AE',
    fontWeight: 'normal',
  },
  mealsContainer: {
    padding: 24,
    marginTop: -10, // Overlap effect? No, let's keep it clean for now
  },
  mealSection: {
    marginBottom: 20,
  },
  mealCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.06)',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealIconParams: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealCalories: {
    fontSize: 14,
    color: '#90A4AE',
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  foodList: {
    gap: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary[50],
  },
  foodIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 3,
  },
  foodServing: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: Colors.neutral[50],
  },
  emptyText: {
    color: Colors.neutral[400],
    fontSize: 14,
    fontWeight: '500',
  },
});
