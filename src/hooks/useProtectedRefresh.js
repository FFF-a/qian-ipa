import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

/**
 * 登录后列表页统一加载：进入页面自动刷新，下拉刷新，未登录不请求。
 */
export function useProtectedRefresh(loadFn, { errorTitle = "加载失败" } = {}) {
  const { isLoggedIn } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    try {
      return await loadFn();
    } catch (err) {
      Alert.alert(errorTitle, err.message || "请稍后重试");
      throw err;
    } finally {
      setRefreshing(false);
    }
  }, [isLoggedIn, loadFn, errorTitle]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        onRefresh();
      }
    }, [isLoggedIn, onRefresh])
  );

  return { refreshing, onRefresh, isLoggedIn };
}
