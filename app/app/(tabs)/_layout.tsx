import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
	return (
		<Tabs>
			<Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => (<Ionicons name="home" color={color} size={size} />) }} />
			<Tabs.Screen name="bookmarks" options={{ title: 'Bookmarks', tabBarIcon: ({ color, size }) => (<Ionicons name="bookmark" color={color} size={size} />) }} />
			<Tabs.Screen name="scanner" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => (<Ionicons name="qr-code" color={color} size={size} />) }} />
			<Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => (<Ionicons name="person" color={color} size={size} />) }} />
		</Tabs>
	);
}