/** 与后端 office_backend validators 规则保持一致 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUserForm(form) {
  const errors = {};
  const name = (form.name || "").trim();
  const ageStr = String(form.age ?? "").trim();
  const email = (form.email || "").trim();

  if (!name) {
    errors.name = "请输入姓名";
  } else if (name.length > 20) {
    errors.name = "姓名不能超过 20 个字符";
  }

  if (!ageStr) {
    errors.age = "请输入年龄";
  } else {
    const age = parseInt(ageStr, 10);
    if (Number.isNaN(age)) {
      errors.age = "年龄必须为整数";
    } else if (age < 18 || age > 60) {
      errors.age = "年龄必须在 18-60 之间";
    }
  }

  if (!email) {
    errors.email = "请输入邮箱";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "邮箱格式不正确，示例：zhangsan@company.com";
  }

  return errors;
}

export function validateCategoryForm(form) {
  const errors = {};
  const name = (form.name || "").trim();
  if (!name) {
    errors.name = "请输入分类名称";
  } else if (name.length > 50) {
    errors.name = "分类名称不能超过 50 个字符";
  }
  return errors;
}

export function validateDeviceForm(form) {
  const errors = {};
  const name = (form.name || "").trim();
  if (!name) {
    errors.name = "请输入设备名称";
  }
  if (!form.category_id) {
    errors.category_id = "请选择设备分类";
  }
  return errors;
}
