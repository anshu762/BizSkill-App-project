import React from 'react';
import { Modal, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { Colors } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface PremiumConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PremiumConfirmModal({
  visible,
  title,
  description,
  iconName = 'alert-circle-outline',
  iconColor = Colors.danger,
  iconBgColor = Colors.dangerTint,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: PremiumConfirmModalProps) {
  const theme = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}>
        <View style={{ width: '100%', maxWidth: 400, borderRadius: 24, backgroundColor: theme.elevated, padding: 24 }}>
          <View style={{ marginBottom: 16, height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: iconBgColor }}>
            <Ionicons name={iconName} size={24} color={iconColor} />
          </View>
          <AppText variant="h2" style={{ marginBottom: 8 }}>{title}</AppText>
          <AppText variant="body" style={{ color: theme.textSecondary, marginBottom: 24 }}>{description}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppButton title={cancelText} variant="secondary" style={{ flex: 1, marginRight: 12 }} onPress={onCancel} disabled={loading} />
            <AppButton title={confirmText} variant={confirmVariant} style={{ flex: 1 }} onPress={onConfirm} loading={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
