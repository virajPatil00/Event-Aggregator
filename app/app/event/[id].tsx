import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import apiClient from '../../src/api/client';
import QRCode from 'react-native-qrcode-svg';

export default function EventDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [event, setEvent] = useState<any | null>(null);
	useEffect(() => { void load(); }, [id]);

	async function load() {
		const res = await apiClient.get(`/api/events/${id}`);
		setEvent(res.data);
	}

	async function rsvp(status: 'GOING' | 'INTERESTED' | 'NOT_GOING') {
		await apiClient.post(`/api/rsvps/${id}`, { status });
		Alert.alert('Saved', `RSVP set to ${status}`);
	}

	async function bookmark() {
		await apiClient.post(`/api/bookmarks/${id}`);
		Alert.alert('Saved', 'Bookmarked');
	}

	if (!event) return <Text>Loading...</Text>;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{event.title}</Text>
			<Text style={styles.meta}>{new Date(event.startTime).toLocaleString()} • {event.location}</Text>
			<Text style={styles.desc}>{event.description}</Text>
			<View style={styles.actions}>
				<Button title="Going" onPress={() => rsvp('GOING')} />
				<Button title="Interested" onPress={() => rsvp('INTERESTED')} />
				<Button title="Bookmark" onPress={bookmark} />
			</View>
			<View style={{ alignItems: 'center', marginTop: 16 }}>
				<Text style={{ marginBottom: 8 }}>Check-in QR</Text>
				<QRCode value={JSON.stringify({ eventId: id })} size={180} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 22, fontWeight: '700' },
	meta: { color: '#666', marginTop: 6 },
	desc: { marginTop: 12 },
	actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }
});