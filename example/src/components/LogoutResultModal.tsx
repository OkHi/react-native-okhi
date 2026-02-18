import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LogoutResultModalProps {
  visible: boolean;
  locationIds: string[] | null;
  onDone: () => void;
}

export function LogoutResultModal({
  visible,
  locationIds,
  onDone,
}: LogoutResultModalProps) {
  const hasIds = Array.isArray(locationIds) && locationIds.length > 0;

  const handleCopyAndContinue = async () => {
    if (hasIds) {
      Clipboard.setString(locationIds!.join('\n'));
    }
    await AsyncStorage.multiRemove([
      'isLoggedIn',
      'appUserId',
      'phone',
      'userEmail',
      'firstName',
      'lastName',
      'userName',
      'environment',
      'okhi_verified_addresses',
    ]);
    onDone();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCopyAndContinue}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Text style={styles.iconEmoji}>✓</Text>
          </View>

          <Text style={styles.title}>Logged Out</Text>
          <Text style={styles.subtitle}>
            {hasIds
              ? `${locationIds!.length} active verification${locationIds!.length === 1 ? '' : 's'} stopped`
              : 'No active verifications were running'}
          </Text>

          {hasIds && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Stopped Location IDs</Text>
              <ScrollView
                style={styles.idList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {locationIds!.map((id, index) => (
                  <View key={id} style={styles.idRow}>
                    <View style={styles.idIndex}>
                      <Text style={styles.idIndexText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.idText} numberOfLines={1} ellipsizeMode="middle">
                      {id}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCopyAndContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>
              {hasIds ? 'Copy IDs & Continue' : 'Continue to Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: width - 48,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconEmoji: {
    fontSize: 30,
    color: '#2E7D32',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  idList: {
    width: '100%',
    maxHeight: 180,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  idIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#005D67',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  idIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  idText: {
    flex: 1,
    fontSize: 13,
    color: '#424242',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  actionBtn: {
    width: '100%',
    backgroundColor: '#005D67',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#005D67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
