import { Alert, Platform } from "react-native";

/** 跨平台提示（Web 上 Alert 有时不明显，补充 window.alert） */
export function showMessage(title, message) {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.alert) {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
