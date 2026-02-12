import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

interface SessionScreenProps {
  email: string;
  startTime: string;
  duration: string;
  onLogout: () => void;
}

const SessionScreen: React.FC<SessionScreenProps> = memo(({ 
  email, 
  startTime, 
  duration, 
  onLogout 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Session Active</Text>
        
        {/* User Info */}
        <View style={styles.userSection}>
          <Text style={styles.label}>Logged in as:</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Session Info */}
        <View style={styles.sessionSection}>
          <View style={styles.sessionRow}>
            <Text style={styles.label}>Session Started:</Text>
            <Text style={styles.value}>{startTime}</Text>
          </View>
          
          <View style={styles.sessionRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={[styles.value, styles.duration]}>{duration}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={onLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 48,
    textAlign: 'center',
  },
  userSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sessionSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 24,
    marginBottom: 48,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  duration: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

SessionScreen.displayName = 'SessionScreen';

export { SessionScreen };
