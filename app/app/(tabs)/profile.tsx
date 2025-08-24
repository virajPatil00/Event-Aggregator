import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import apiClient from '../../src/api/client';

export default function ProfileScreen() {
	const { user, logout } = useAuth();
	const [categories, setCategories] = useState('');
	const [departments, setDepartments] = useState('');
	useEffect(() => { void load(); }, []);

	async function load() {
		const res = await apiClient.get('/api/preferences');
		const cats = (res.data?.categories || []) as string[];
		const deps = (res.data?.departments || []) as string[];
		setCategories(cats.join(', '));
		setDepartments(deps.join(', '));
	}

	async function savePrefs() {
		await apiClient.put('/api/preferences', {
			categories: categories.split(',').map(s => s.trim()).filter(Boolean),
			departments: departments.split(',').map(s => s.trim()).filter(Boolean)
		});
		Alert.alert('Saved', 'Preferences updated');
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{user?.name}</Text>
			<Text style={{ color: '#666' }}>{user?.email}</Text>
			<Text style={styles.section}>Preferences</Text>
			<TextInput placeholder="Categories (comma separated)" value={categories} onChangeText={setCategories} style={styles.input} />
			<TextInput placeholder="Departments (comma separated)" value={departments} onChangeText={setDepartments} style={styles.input} />
			<Button title="Save Preferences" onPress={savePrefs} />
			<View style={{ height: 20 }} />
			<Button title="Logout" color="#b00" onPress={() => void logout()} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 20, fontWeight: '700' },
	section: { marginTop: 16, fontWeight: '600' },
	input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginVertical: 8 }
});