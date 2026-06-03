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
    <View style={[{ marginBottom: 16 }, style]}>
      <AppText variant="label" style={{ marginBottom: 8, color: theme.textPrimary }}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={theme.textTertiary}
        style={[
          styles.input,
          {
            backgroundColor: theme.elevated,
            borderColor: error ? Colors.danger : isFocused ? Colors.brand : theme.border,
            color: theme.textPrimary,
          },
          props.multiline && { height: 100, paddingTop: 16 },
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
  },
});
