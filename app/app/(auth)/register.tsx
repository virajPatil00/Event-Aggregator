import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
	const { register } = useAuth();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	async function onSubmit() {
		try {
			setLoading(true);
			await register(name.trim(), email.trim(), password);
		} catch (e: any) {
			Alert.alert('Registration failed', e?.response?.data?.error || 'Please try again');
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create account</Text>
			<TextInput placeholder="Full name" value={name} onChangeText={setName} style={styles.input} />
			<TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
			<TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
			<Button title={loading ? 'Creating...' : 'Sign Up'} onPress={onSubmit} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 16 },
	title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
	input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 }
});