import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import apiClient from '../../src/api/client';

export default function ScannerScreen() {
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scanned, setScanned] = useState(false);

	useEffect(() => {
		(async () => {
			const { status } = await BarCodeScanner.requestPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, []);

	async function handleBarCodeScanned({ data }: { data: string }) {
		setScanned(true);
		try {
			const parsed = JSON.parse(data);
			if (parsed.eventId) {
				await apiClient.post('/api/checkin', { eventId: parsed.eventId });
				Alert.alert('Checked in', 'Your attendance was recorded');
			}
		} catch {
			Alert.alert('Invalid QR', 'Could not parse QR content');
		}
	}

	if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
	if (hasPermission === false) return <Text>No access to camera</Text>;

	return (
		<View style={{ flex: 1 }}>
			<BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={{ flex: 1 }} />
			{scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
		</View>
	);
}