import axios from 'axios';
import Constants from 'expo-constants';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
	authToken = token;
}

function getBaseUrl(): string {
	const fromEnv = process.env.EXPO_PUBLIC_API_URL as string | undefined;
	const fromExtra = (Constants?.expoConfig?.extra as any)?.apiUrl as string | undefined;
	return fromEnv || fromExtra || 'http://localhost:4000';
}

const apiClient = axios.create({ baseURL: getBaseUrl() });

apiClient.interceptors.request.use((config) => {
	if (authToken) {
		config.headers = config.headers || {};
		(config.headers as any).Authorization = `Bearer ${authToken}`;
	}
	return config;
});

export default apiClient;