const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
  to: string;
  sound?: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>) {
  const message: ExpoPushMessage = { to: token, sound: "default", title, body, data };
  try {
    const res = await fetch(EXPO_PUSH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    const result = await res.json();
    if (!res.ok) console.error("Push notification error:", result);
    return result;
  } catch (error) {
    console.error("Push notification failed:", error);
  }
}
