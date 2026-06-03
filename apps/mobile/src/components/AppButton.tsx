import { useState, useRef } from "react";
import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

interface AppButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  onPress?: () => void | Promise<void>;
}

export function AppButton({
  label,
  loading: externalLoading = false,
  variant = "primary",
  disabled,
  className,
  onPress,
  ...props
}: AppButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isExecuting = useRef(false);
  const loading = externalLoading || internalLoading;

  const handlePress = async () => {
    if (!onPress || loading || disabled || isExecuting.current) return;
    const result = onPress();
    if (result && typeof (result as any).then === "function") {
      isExecuting.current = true;
      setInternalLoading(true);
      try {
        await result;
      } finally {
        isExecuting.current = false;
        setInternalLoading(false);
      }
    }
  };

  const styles = {
    primary: "bg-brand",
    secondary: "bg-ink",
    outline: "border border-brand/20 bg-white",
  };
  const textStyles = variant === "outline" ? "text-brand" : "text-white";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={disabled || loading}
      onPress={handlePress}
      className={`h-14 items-center justify-center rounded-2xl ${styles[variant]} ${className ?? ""}`}
      style={{ opacity: disabled || loading ? 0.6 : 1 }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#5B4DFF" : "#FFFFFF"} />
      ) : (
        <Text className={`text-base font-semibold ${textStyles}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

