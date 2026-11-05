import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

interface LoginResultModalProps {
  visible: boolean;
  locationIds: string[] | null;
  onDone: () => void;
}

type LoginResultCheck = {
  status: 'ok' | 'warning' | 'error';
  title: string;
  message: string;
};

// The native SDKs resolve login with null, an empty array, or a list of location IDs.
// Anything else means the bridge returned something unexpected.
function checkLoginResult(value: unknown): LoginResultCheck {
  if (value === null || value === undefined) {
    return {
      status: 'warning',
      title: 'No Value Returned',
      message: `login() returned ${value}. Check the credentials and user details.`,
    };
  }
  if (!Array.isArray(value)) {
    return {
      status: 'error',
      title: 'Unexpected Value',
      message: `Expected string[] | null but got ${typeof value}.`,
    };
  }
  const invalid = value.filter(
    (id) => typeof id !== 'string' || id.trim().length === 0
  );
  if (invalid.length > 0) {
    return {
      status: 'error',
      title: 'Invalid Location IDs',
      message: `${invalid.length} of ${value.length} entr${
        value.length === 1 ? 'y is' : 'ies are'
      } not a non-empty string.`,
    };
  }
  if (value.length === 0) {
    return {
      status: 'ok',
      title: 'Logged In',
      message: 'Login successful, no location IDs returned',
    };
  }
  return {
    status: 'ok',
    title: 'Logged In',
    message: `${value.length} location ID${
      value.length === 1 ? '' : 's'
    } returned`,
  };
}

const STATUS_STYLES = {
  ok: { icon: '✓', color: '#2E7D32', background: '#E8F5E9' },
  warning: { icon: '!', color: '#E65100', background: '#FFF3E0' },
  error: { icon: '✕', color: '#C62828', background: '#FFEBEE' },
};

export function LoginResultModal({
  visible,
  locationIds,
  onDone,
}: LoginResultModalProps) {
  const check = checkLoginResult(locationIds);
  const statusStyle = STATUS_STYLES[check.status];
  const hasIds =
    check.status === 'ok' &&
    Array.isArray(locationIds) &&
    locationIds.length > 0;
  const rawValue =
    locationIds === undefined
      ? 'undefined'
      : JSON.stringify(locationIds, null, 2);

  const handleCopyAndContinue = () => {
    if (hasIds) {
      Clipboard.setString(locationIds!.join('\n'));
    }
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
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: statusStyle.background },
            ]}
          >
            <Text style={[styles.iconEmoji, { color: statusStyle.color }]}>
              {statusStyle.icon}
            </Text>
          </View>

          <Text style={styles.title}>{check.title}</Text>
          <Text style={styles.subtitle}>{check.message}</Text>

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Returned Value</Text>
          <ScrollView style={styles.rawValueBox} nestedScrollEnabled>
            <Text style={styles.rawValueText} selectable>
              {rawValue}
            </Text>
          </ScrollView>

          {hasIds && (
            <>
              <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                Location IDs
              </Text>
              <ScrollView
                style={styles.idList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {locationIds!.map((id, index) => (
                  <View key={`${index}-${id}`} style={styles.idRow}>
                    <View style={styles.idIndex}>
                      <Text style={styles.idIndexText}>{index + 1}</Text>
                    </View>
                    <Text
                      style={styles.idText}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
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
              {hasIds ? 'Copy IDs & Continue' : 'Continue'}
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
  sectionLabelSpaced: {
    marginTop: 16,
  },
  rawValueBox: {
    width: '100%',
    maxHeight: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rawValueText: {
    fontSize: 12,
    color: '#424242',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
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
