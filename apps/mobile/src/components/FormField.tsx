import React, { useState } from "react";
import { TextInput, type TextInputProps, View, StyleSheet } from "react-native";
import { AppText } from "./ui/AppText";
import { useThemeColors } from "../hooks/useThemeColors";
import { Colors, Radius } from "../constants/theme";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, style, ...props }: FormFieldProps) {
  const theme = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ marginBottom: 20 }, style as any]}>
      <AppText variant="label" style={{ marginBottom: 8, color: '#64748B', fontSize: 13, fontFamily: 'Outfit_600SemiBold', letterSpacing: 0.3 }}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor="#94A3B8"
        style={[
          styles.input,
          {
            backgroundColor: isFocused ? '#FFFFFF' : '#F8FAFC',
            borderColor: error ? Colors.danger : isFocused ? Colors.brand : '#E2E8F0',
            borderWidth: isFocused ? 1.5 : 1,
            color: theme.textPrimary,
          },
          props.multiline && { height: 120, paddingTop: 16, textAlignVertical: 'top' },
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <AppText style={{ marginTop: 6, color: Colors.danger, fontSize: 12 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Outfit_500Medium',
  },
});
