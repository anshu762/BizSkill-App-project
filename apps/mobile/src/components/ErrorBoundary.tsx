import { Component, type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 items-center justify-center bg-surface px-6 dark:bg-surface-dark">
          <Text className="mb-2 text-lg font-bold text-ink dark:text-ink-dark">Something went wrong</Text>
          <Text className="mb-6 text-center text-sm text-muted dark:text-muted-dark">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            className="rounded-full bg-brand px-8 py-3"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}
