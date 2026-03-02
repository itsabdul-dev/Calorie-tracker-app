import { Tabs } from 'expo-router';
import { Chrome as Home, BarChart2, PlusCircle, User, Camera, Search, MessageCircle } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarStyle: {
          backgroundColor: Colors.neutral[0],
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: Colors.shadow.lg.shadowColor,
          shadowOffset: Colors.shadow.lg.shadowOffset,
          shadowOpacity: Colors.shadow.lg.shadowOpacity,
          shadowRadius: Colors.shadow.lg.shadowRadius,
          height: 80, // Taller premium tab bar
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="ai-scan"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <MotiView
              from={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'timing',
                duration: 1500,
                loop: true,
              }}
              style={styles.fabContainer}
            >
              <LinearGradient
                colors={[Colors.accent[400], Colors.accent[600]]}
                style={styles.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Camera size={32} color="#FFF" />
              </LinearGradient>
            </MotiView>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />

      {/* Hidden Tabs */}
      <Tabs.Screen
        name="add"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    marginTop: -30,
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.neutral[0],
  },
});
