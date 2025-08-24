import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
	return (
		<AuthProvider>
			<StatusBar style="dark" />
			<Stack>
				<Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
				<Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="event/[id]" options={{ title: 'Event' }} />
			</Stack>
		</AuthProvider>
	);
}