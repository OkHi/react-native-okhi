import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
} from 'react-native';

interface LogoutBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export function LogoutBottomSheet({
  visible,
  onClose,
  onLogout,
  isLoggingOut,
}: LogoutBottomSheetProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 28,
          stiffness: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
      });
    }
  }, [visible, slideAnim, backdropAnim]);

  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose} disabled={isLoggingOut}>
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              disabled={isLoggingOut}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Logout option */}
          <TouchableOpacity
            style={[styles.option, isLoggingOut && styles.optionDisabled]}
            onPress={onLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconWrap}>
              <Text style={styles.optionIconEmoji}>🚪</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Logout</Text>
              <Text style={styles.optionSubtitle}>
                Stop active verifications and sign out
              </Text>
            </View>
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#D32F2F" />
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPad} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 24,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionIconEmoji: {
    fontSize: 22,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#B71C1C',
    opacity: 0.7,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 24,
    color: '#D32F2F',
    fontWeight: '300',
    marginLeft: 8,
  },
  bottomPad: {
    height: 32,
  },
});
