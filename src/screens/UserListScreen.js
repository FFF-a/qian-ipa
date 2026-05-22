import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../api/users";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import EmptyState from "../components/EmptyState";
import FormModal from "../components/FormModal";
import ListCard from "../components/ListCard";
import { useProtectedRefresh } from "../hooks/useProtectedRefresh";
import { showMessage } from "../utils/alert";
import { validateUserForm } from "../utils/validation";
import { colors, spacing, typography } from "../theme";

const emptyForm = { name: "", age: "", email: "" };

export default function UserListScreen() {
  const [list, setList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchUsers(1, 50);
    setList(data.items || []);
  }, []);

  const { refreshing, onRefresh } = useProtectedRefresh(loadData);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      age: String(item.age),
      email: item.email,
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleSave = async () => {
    const errors = validateUserForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMessage("请检查表单", Object.values(errors).join("\n"));
      return;
    }

    const payload = {
      name: form.name.trim(),
      age: parseInt(String(form.age).trim(), 10),
      email: form.email.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      setModalVisible(false);
      setFormErrors({});
      await loadData();
    } catch (err) {
      const msg = err.message || "保存失败";
      if (msg.includes("邮箱")) {
        setFormErrors({ email: msg });
      } else if (msg.includes("年龄")) {
        setFormErrors({ age: msg });
      } else if (msg.includes("姓名")) {
        setFormErrors({ name: msg });
      }
      showMessage("保存失败", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert("确认删除", `删除员工「${item.name}」？`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(item.id);
            await loadData();
          } catch (err) {
            Alert.alert("删除失败", err.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <ListCard
      title={item.name}
      subtitle={item.email}
      badge={`${item.age} 岁`}
      onEdit={() => openEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>共 {list.length} 人</Text>
        <View style={styles.addWrap}>
          <AppButton title="+ 新增员工" onPress={openCreate} size="sm" fullWidth={false} />
        </View>
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !refreshing ? (
            <EmptyState title="暂无员工" hint="点击右上角新增第一位员工" />
          ) : null
        }
      />

      <FormModal
        visible={modalVisible}
        title={editingId ? "编辑员工" : "新增员工"}
        onClose={() => setModalVisible(false)}
      >
        <AppInput
          label="姓名"
          hint="1-20 个字符"
          value={form.name}
          error={formErrors.name}
          onChangeText={(v) => {
            setForm({ ...form, name: v });
            if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
          }}
          placeholder="请输入姓名"
        />
        <AppInput
          label="年龄"
          hint="18-60 的整数"
          value={form.age}
          error={formErrors.age}
          onChangeText={(v) => {
            setForm({ ...form, age: v });
            if (formErrors.age) setFormErrors((e) => ({ ...e, age: undefined }));
          }}
          keyboardType="number-pad"
          placeholder="请输入年龄"
        />
        <AppInput
          label="邮箱"
          hint="须包含 @ 和域名，如 zhangsan@company.com"
          value={form.email}
          error={formErrors.email}
          onChangeText={(v) => {
            setForm({ ...form, email: v });
            if (formErrors.email) setFormErrors((e) => ({ ...e, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="name@company.com"
        />
        <AppButton title="保存" onPress={handleSave} loading={saving} />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  count: { ...typography.caption, fontWeight: "600" },
  addWrap: { minWidth: 120 },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
});
