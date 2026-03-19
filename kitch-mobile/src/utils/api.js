import Constants from 'expo-constants';

/**
 * Resolves the backend API base URL dynamically.
 * In development, it uses the host machine's IP address.
 * In production, it falls back to the Cloud Run URL.
 */
export const getApiBaseUrl = () => {
    // Hardcoded fallback for your current network in case discovery fails
    const FALLBACK_IP = '192.168.1.88';
    
    // Extract host from Expo's manifest
    const debuggerHost = Constants.expoConfig?.hostUri;
    
    if (__DEV__) {
        let host;
        if (debuggerHost) {
            host = debuggerHost.split(':')[0];
            console.log(`[API] Detected host from Expo: ${host}`);
        } else {
            host = FALLBACK_IP;
            console.log(`[API] Discovery failed, using fallback IP: ${host}`);
        }
        return `http://${host}:8080`; 
    }

    // Default to the latest deployed Cloud Run service for production-like testing
    return 'https://remi-engine-v2-r7irowrevq-uc.a.run.app';
};

export const getDataConnectHost = () => {
    // Hardcoded fallback
    const FALLBACK_IP = '192.168.1.88';
    
    if (__DEV__) {
        const debuggerHost = Constants.expoConfig?.hostUri;
        if (debuggerHost) {
            return debuggerHost.split(':')[0];
        }
        return FALLBACK_IP;
    }
    return 'localhost';
};
