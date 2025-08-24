import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router, useSegments } from 'expo-router';
import apiClient, { setAuthToken } from '../api/client';

export type User = { id: string; email: string; name: string; role: 'STUDENT' | 'ORGANIZER' | 'ADMIN' };

type AuthContextType = {
	user: User | null;
	token: string | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const segments = useSegments();

	useEffect(() => {
		(async () => {
			const stored = await SecureStore.getItemAsync('auth_token');
			if (stored) {
				setToken(stored);
				setAuthToken(stored);
				try {
					// No me endpoint; keep user null until login/register returns data
				} catch {}
			}
			setLoading(false);
		})();
	}, []);

	useEffect(() => {
		const inAuthGroup = segments[0] === '(auth)';
		if (!loading) {
			if (!token && !inAuthGroup) router.replace('/(auth)/login');
			if (token && inAuthGroup) router.replace('/(tabs)');
		}
	}, [token, loading, segments]);

	async function login(email: string, password: string) {
		const res = await apiClient.post('/api/auth/login', { email, password });
		const { token, user } = res.data;
		await SecureStore.setItemAsync('auth_token', token);
		setAuthToken(token);
		setToken(token);
		setUser(user);
		router.replace('/(tabs)');
	}

	async function register(name: string, email: string, password: string) {
		const res = await apiClient.post('/api/auth/register', { name, email, password });
		const { token, user } = res.data;
		await SecureStore.setItemAsync('auth_token', token);
		setAuthToken(token);
		setToken(token);
		setUser(user);
		router.replace('/(tabs)');
	}

	async function logout() {
		await SecureStore.deleteItemAsync('auth_token');
		setAuthToken(null);
		setToken(null);
		setUser(null);
		router.replace('/(auth)/login');
	}

	return (
		<AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}