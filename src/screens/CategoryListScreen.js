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
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../api/categories";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import EmptyState from "../components/EmptyState";
import FormModal from "../components/FormModal";
import ListCard from "../components/ListCard";
import { useProtectedRefresh } from "../hooks/useProtectedRefresh";
import { showMessage } from "../utils/alert";
import { validateCategoryForm } from "../utils/validation";
import { colors, spacing, typography } from "../theme";

const emptyForm = { name: "", description: "" };

export default function CategoryListScreen() {
  const [list, setList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchCategories();
    setList(Array.isArray(data) ? data : []);
  }, []);

  const { refreshing, onRefresh } = useProtectedRefresh(loadData);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const errors = validateCategoryForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMessage("请检查表单", Object.values(errors).join("\n"));
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    };
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      setModalVisible(false);
      await loadData();
    } catch (err) {
      showMessage("保存失败", err.message || "请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "确认删除",
      `删除分类「${item.name}」？\n（分类下有设备时无法删除）`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(item.id);
              await loadData();
            } catch (err) {
              Alert.alert("删除失败", err.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <ListCard
      title={item.name}
      subtitle={item.description || "暂无描述"}
      badge={`${item.device_count ?? 0} 台设备`}
      badgeTone={(item.device_count ?? 0) > 0 ? "warning" : "success"}
      onEdit={() => openEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>共 {list.length} 个分类</Text>
        <View style={styles.addWrap}>
          <AppButton title="+ 新增分类" onPress={openCreate} size="sm" fullWidth={false} />
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
            <EmptyState title="暂无分类" hint="先创建分类，再添加设备" />
          ) : null
        }
      />

      <FormModal
        visible={modalVisible}
        title={editingId ? "编辑分类" : "新增分类"}
        onClose={() => setModalVisible(false)}
      >
        <AppInput
          label="分类名称"
          value={form.name}
          error={formErrors.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          placeholder="如：办公电脑"
        />
        <AppInput
          label="描述"
          hint="可选"
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          placeholder="简要说明该分类用途"
          multiline
          numberOfLines={3}
          inputStyle={{ minHeight: 88, textAlignVertical: "top", paddingTop: 12 }}
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
