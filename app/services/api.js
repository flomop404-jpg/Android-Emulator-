import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Emulator API Calls
export const emulatorAPI = {
  // Get emulator status
  getStatus: async () => {
    try {
      const response = await api.get('/emulator/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Start emulator
  start: async () => {
    try {
      const response = await api.post('/emulator/start');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Stop emulator
  stop: async () => {
    try {
      const response = await api.post('/emulator/stop');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reboot emulator
  reboot: async () => {
    try {
      const response = await api.post('/emulator/reboot');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system info
  getSystemInfo: async () => {
    try {
      const response = await api.get('/system/info');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Screenshot
  takeScreenshot: async () => {
    try {
      const response = await api.get('/emulator/screenshot', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check health
  health: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ROM API Calls
export const romAPI = {
  // Get available ROMs
  listROMs: async () => {
    try {
      const response = await api.get('/rom/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Flash ROM
  flashROM: async (romPath, partition = 'boot') => {
    try {
      const response = await api.post('/rom/flash', {
        rom_path: romPath,
        partition,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get flash job status
  getFlashStatus: async (jobId) => {
    try {
      const response = await api.get(`/rom/flash/${jobId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Erase partition
  erasePartition: async (partition) => {
    try {
      const response = await api.post('/rom/erase', { partition });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// App API Calls
export const appAPI = {
  // List installed apps
  listApps: async () => {
    try {
      const response = await api.get('/app/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Install APK
  installAPK: async (apkPath) => {
    try {
      const response = await api.post('/app/install', {
        apk_path: apkPath,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Uninstall app
  uninstallApp: async (packageName) => {
    try {
      const response = await api.post('/app/uninstall', {
        package_name: packageName,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Launch app
  launchApp: async (packageName, activity) => {
    try {
      const response = await api.post('/app/launch', {
        package_name: packageName,
        activity,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Stop app
  stopApp: async (packageName) => {
    try {
      const response = await api.post('/app/stop', {
        package_name: packageName,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get app info
  getAppInfo: async (packageName) => {
    try {
      const response = await api.get(`/app/${packageName}/info`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Shell/Terminal API Calls
export const shellAPI = {
  // Execute shell command
  executeCommand: async (command) => {
    try {
      const response = await api.post('/shell', { command });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get logcat
  getLogcat: async (lines = 100) => {
    try {
      const response = await api.get('/shell/logcat', {
        params: { lines },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear logcat
  clearLogcat: async () => {
    try {
      const response = await api.post('/shell/logcat/clear');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Push file
  pushFile: async (localPath, remotePath) => {
    try {
      const response = await api.post('/files/push', {
        local_path: localPath,
        remote_path: remotePath,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Pull file
  pullFile: async (remotePath) => {
    try {
      const response = await api.post('/files/pull', {
        remote_path: remotePath,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ADB API Calls
export const adbAPI = {
  // Get connected devices
  getDevices: async () => {
    try {
      const response = await api.get('/adb/devices');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Connect to device
  connectDevice: async (host, port = 5555) => {
    try {
      const response = await api.post('/adb/connect', {
        host,
        port,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Disconnect device
  disconnectDevice: async (deviceId) => {
    try {
      const response = await api.post('/adb/disconnect', {
        device_id: deviceId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get device properties
  getDeviceProps: async () => {
    try {
      const response = await api.get('/adb/properties');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Settings API Calls
export const settingsAPI = {
  // Get app settings
  getSettings: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      return token ? { authenticated: true } : { authenticated: false };
    } catch (error) {
      return { authenticated: false };
    }
  },

  // Save server connection
  saveConnection: async (host, port, token) => {
    try {
      await SecureStore.setItemAsync('server_host', host);
      await SecureStore.setItemAsync('server_port', String(port));
      if (token) {
        await SecureStore.setItemAsync('auth_token', token);
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Get saved connection
  getConnection: async () => {
    try {
      const host = await SecureStore.getItemAsync('server_host');
      const port = await SecureStore.getItemAsync('server_port');
      return {
        host: host || 'localhost',
        port: port ? parseInt(port) : 3000,
      };
    } catch (error) {
      return { host: 'localhost', port: 3000 };
    }
  },

  // Clear connection
  clearConnection: async () => {
    try {
      await SecureStore.deleteItemAsync('server_host');
      await SecureStore.deleteItemAsync('server_port');
      await SecureStore.deleteItemAsync('auth_token');
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

export default api;
