import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface BizCoinBadgeProps {
  amount: number;
  style?: ViewStyle;
}

export function BizCoinBadge({ amount, style }: BizCoinBadgeProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.coin}>
        <AppText style={styles.coinText}>₿</AppText>
      </View>
      <AppText style={styles.amountText}>{amount} BizCoins</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bizcoinTint,
    borderWidth: 0.5,
    borderColor: Colors.bizcoin,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  coin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.bizcoin,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  coinText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Outfit_700Bold',
  },
  amountText: {
    color: Colors.bizcoinDark,
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
  },
});
