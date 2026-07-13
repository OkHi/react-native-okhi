import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    if (variant === 'primary') {
      return [
        styles.button,
        styles.primaryButton,
        isDisabled && styles.disabledButton,
        style,
      ];
    }
    if (variant === 'secondary') {
      return [
        styles.button,
        styles.secondaryButton,
        isDisabled && styles.disabledButton,
        style,
      ];
    }
    return [
      styles.button,
      styles.outlineButton,
      isDisabled && styles.disabledButton,
      style,
    ];
  };

  const getTextStyle = () => {
    if (variant === 'primary') {
      return [styles.buttonText, styles.primaryText, textStyle];
    }
    if (variant === 'secondary') {
      return [styles.buttonText, styles.secondaryText, textStyle];
    }
    return [styles.buttonText, styles.outlineText, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#005D67' : '#FFFFFF'}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#005D67',
  },
  secondaryButton: {
    backgroundColor: '#008C9E',
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#005D67',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#005D67',
  },
});
