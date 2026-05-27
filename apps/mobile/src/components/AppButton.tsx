import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

interface AppButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export function AppButton({
  label,
  loading = false,
  variant = "primary",
  disabled,
  className,
  ...props
}: AppButtonProps) {
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
      className={`h-14 items-center justify-center rounded-2xl ${styles[variant]} ${
        disabled || loading ? "opacity-60" : ""
      } ${className ?? ""}`}
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

