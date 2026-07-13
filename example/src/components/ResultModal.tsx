import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: any;
  locationId?: string;
}

export function ResultModal({
  visible,
  onClose,
  title,
  data,
  locationId,
}: ResultModalProps) {
  const handleCopyLocationId = () => {
    if (locationId) {
      Clipboard.setString(locationId);
      onClose();
      setTimeout(() => {
        Alert.alert('Success', 'Location ID copied to clipboard!');
      }, 300);
    }
  };

  const renderValue = (value: any, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <Text style={styles.nullValue}>null</Text>;
    }

    if (typeof value === 'boolean') {
      return <Text style={styles.booleanValue}>{value.toString()}</Text>;
    }

    if (typeof value === 'number') {
      return <Text style={styles.numberValue}>{value}</Text>;
    }

    if (typeof value === 'string') {
      return <Text style={styles.stringValue}>"{value}"</Text>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text style={styles.emptyArray}>[]</Text>;
      }
      return (
        <View style={{ marginLeft: depth > 0 ? 16 : 0 }}>
          {value.map((item, index) => (
            <View key={index} style={styles.arrayItem}>
              <Text style={styles.arrayIndex}>{index}:</Text>
              {renderValue(item, depth + 1)}
            </View>
          ))}
        </View>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <Text style={styles.emptyObject}>{'{}'}</Text>;
      }
      return (
        <View style={{ marginLeft: depth > 0 ? 16 : 0 }}>
          {entries.map(([key, val]) => (
            <View key={key} style={styles.objectRow}>
              <Text style={styles.objectKey}>{key}:</Text>
              <View style={styles.objectValue}>
                {renderValue(val, depth + 1)}
              </View>
            </View>
          ))}
        </View>
      );
    }

    return <Text>{String(value)}</Text>;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {renderValue(data)}
          </ScrollView>

          {locationId && (
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLocationId}
            >
              <Text style={styles.copyButtonText}>Copy Location ID</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width - 40,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    padding: 24,
    maxHeight: 400,
  },
  objectRow: {
    marginBottom: 12,
  },
  objectKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005D67',
    marginBottom: 4,
  },
  objectValue: {
    marginLeft: 12,
  },
  arrayItem: {
    marginBottom: 8,
  },
  arrayIndex: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7E57C2',
    marginBottom: 4,
  },
  stringValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  numberValue: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '500',
  },
  booleanValue: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  nullValue: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  emptyArray: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  emptyObject: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  copyButton: {
    backgroundColor: '#005D67',
    marginHorizontal: 24,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#005D67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
