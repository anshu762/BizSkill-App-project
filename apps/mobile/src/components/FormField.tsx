import { Text, TextInput, type TextInputProps, View } from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, className, ...props }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-ink">{label}</Text>
      <TextInput
        placeholderTextColor="#98A2B3"
        className={`h-14 rounded-2xl border px-4 text-base text-ink ${
          error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
        } ${className ?? ""}`}
        {...props}
      />
      {error ? <Text className="mt-1.5 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

