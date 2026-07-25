import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { emulatorAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [statusData, infoData] = await Promise.all([
        emulatorAPI.getStatus(),
        emulatorAPI.getSystemInfo(),
      ]);
      setStatus(statusData);
      setSystemInfo(infoData);
    } catch (error) {
      console.error('Error fetching status:', error);
      Alert.alert('Error', 'Failed to fetch emulator status');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      await emulatorAPI.start();
      Alert.alert('Success', 'Emulator starting...');
      await fetchStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to start emulator');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await emulatorAPI.stop();
      Alert.alert('Success', 'Emulator stopping...');
      await fetchStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to stop emulator');
    } finally {
      setLoading(false);
    }
  };

  const handleReboot = async () => {
    try {
      setLoading(true);
      await emulatorAPI.reboot();
      Alert.alert('Success', 'Emulator rebooting...');
      await fetchStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to reboot emulator');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Status Card */}
      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <Text style={styles.title}>Emulator Status</Text>
          <View
            style={[
              styles.statusBadge,
              status?.running ? styles.statusRunning : styles.statusStopped,
            ]}
          >
            <Text style={styles.statusText}>
              {status?.running ? 'RUNNING' : 'STOPPED'}
            </Text>
          </View>
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.infoText}>
            Uptime: {status?.uptime || '0h 0m 0s'}
          </Text>
          <Text style={styles.infoText}>
            Memory: {status?.memory_usage || 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            CPU: {status?.cpu_usage || 'N/A'}
          </Text>
        </View>
      </View>

      {/* System Info Card */}
      {systemInfo && (
        <View style={styles.card}>
          <Text style={styles.title}>System Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Android</Text>
              <Text style={styles.infoValue}>
                {systemInfo.android_version || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>API Level</Text>
              <Text style={styles.infoValue}>
                {systemInfo.sdk_version || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {systemInfo.build_id || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Device</Text>
              <Text style={styles.infoValue}>
                {systemInfo.device_name || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.title}>Quick Actions</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.buttonStart]}
            onPress={handleStart}
            disabled={status?.running}
          >
            <MaterialIcons name="play-arrow" size={24} color="#fff" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonStop]}
            onPress={handleStop}
            disabled={!status?.running}
          >
            <MaterialIcons name="stop" size={24} color="#fff" />
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonReboot]}
            onPress={handleReboot}
            disabled={!status?.running}
          >
            <MaterialIcons name="restart-alt" size={24} color="#fff" />
            <Text style={styles.buttonText}>Reboot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonScreenshot]}
            onPress={() => navigation.navigate('Emulator')}
          >
            <MaterialIcons name="screenshot-monitor" size={24} color="#fff" />
            <Text style={styles.buttonText}>Screenshot</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Shortcuts */}
      <View style={styles.card}>
        <Text style={styles.title}>Manage</Text>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ROMTab')}
        >
          <MaterialIcons name="memory" size={24} color="#3B82F6" />
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Flash ROM</Text>
            <Text style={styles.navSubtitle}>Flash custom Android ROMs</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AppsTab')}
        >
          <MaterialIcons name="apps" size={24} color="#3B82F6" />
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Manage Apps</Text>
            <Text style={styles.navSubtitle}>Install, uninstall & launch apps</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Terminal')}
        >
          <MaterialIcons name="terminal" size={24} color="#3B82F6" />
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Terminal</Text>
            <Text style={styles.navSubtitle}>Execute shell commands</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusRunning: {
    backgroundColor: '#10B981',
  },
  statusStopped: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusInfo: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginVertical: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonStart: {
    backgroundColor: '#10B981',
  },
  buttonStop: {
    backgroundColor: '#EF4444',
  },
  buttonReboot: {
    backgroundColor: '#F59E0B',
  },
  buttonScreenshot: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    marginVertical: 8,
  },
  navContent: {
    flex: 1,
    marginLeft: 12,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default HomeScreen;
