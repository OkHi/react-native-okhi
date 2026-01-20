import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: any;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, style, containerStyle, ...props }, ref) => {
    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            {...props}
            style={[styles.input, style]}
            underlineColorAndroid="transparent"
            placeholderTextColor={props.placeholderTextColor ?? '#9E9E9E'}
          />
        </View>
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 20,
    ...(Platform.OS === 'android'
      ? { paddingVertical: 12, textAlignVertical: 'center' as const }
      : { paddingVertical: 16 }),
  },
});
