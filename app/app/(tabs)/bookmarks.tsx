import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import apiClient from '../../src/api/client';
import { router } from 'expo-router';

export default function BookmarksScreen() {
	const [items, setItems] = useState<any[]>([]);
	useEffect(() => { void load(); }, []);

	async function load() {
		const res = await apiClient.get('/api/bookmarks');
		setItems(res.data);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={items}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.card} onPress={() => router.push(`/event/${item.id}`)}>
						<Text style={styles.title}>{item.title}</Text>
						<Text style={styles.meta}>{new Date(item.startTime).toLocaleString()} • {item.location}</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 12 },
	card: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 },
	title: { fontSize: 16, fontWeight: '600' },
	meta: { color: '#666', marginTop: 8, fontSize: 12 }
});