import { ActivityIndicator, Text, TouchableOpacity, Pressable, type TouchableOpacityProps, type ViewStyle, type TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SelectableChipProps extends Omit<TouchableOpacityProps, 'onPress'> {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  loading?: boolean;
  error?: boolean;
  onPress?: () => void | Promise<void>;
  chipStyle?: "default" | "pill" | "large";
}

export function SelectableChip({
  label,
  selected = false,
  loading = false,
  error = false,
  disabled = false,
  onPress,
  className = "",
  chipStyle = "default",
  ...props
}: SelectableChipProps) {
  const isPill = chipStyle === "pill";
  const isLarge = chipStyle === "large";
  
  const baseClasses = `flex-row items-center justify-center border ${
    isLarge ? "flex-1 rounded-2xl py-4 mr-2" : isPill ? "mr-2 mb-2 rounded-full px-5 py-3" : "mb-2 mr-2 rounded-full px-4 py-2"
  }`;

  const containerClasses = [
    baseClasses,
    !selected && !error ? "bg-white border-slate-200" : "",
    selected ? "bg-brand border-brand" : "",
    error ? "bg-red-50 border-red-500" : "",
    className
  ].filter(Boolean).join(" ");

  const textClasses = [
    isLarge ? "text-sm font-bold" : isPill ? "text-sm font-medium" : "text-xs font-medium",
    !selected && !error ? "text-ink" : "",
    selected ? "text-white" : "",
    error ? "text-red-700" : ""
  ].filter(Boolean).join(" ");

  const overrideBg = selected ? { backgroundColor: "#5B4DFF", borderColor: "#5B4DFF" } : undefined;
  const overrideText = selected ? { color: "#FFFFFF" } : undefined;
  const combinedStyle = { ...overrideBg, opacity: disabled || loading ? 0.6 : 1 };

  const { activeOpacity, ...restProps } = props as any;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      className={containerClasses}
      style={({ pressed }) => [
        combinedStyle as ViewStyle, 
        restProps.style as ViewStyle,
        pressed && !disabled && !loading ? { opacity: activeOpacity ?? 0.88 } : undefined
      ]}
      {...restProps}
    >
      {loading ? (
        <ActivityIndicator size="small" color={selected ? "#FFFFFF" : "#5B4DFF"} />
      ) : (
        <>
          {props.icon && (
            <Ionicons 
              name={props.icon as any} 
              size={16} 
              color={selected ? "#FFFFFF" : "#64748B"} 
              style={{ marginRight: 6 }} 
            />
          )}
          <Text className={textClasses} style={overrideText as TextStyle}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
