"use server";

import { consumePasswordResetToken } from "@/lib/admin-user-lifecycle";
import { consumePasswordResetTokenSchema } from "@/validators/user.schema";

import type { ResetPasswordState } from "./action-state";
export type { ResetPasswordState };

function formDataToObject(formData: FormData) {
  return {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
}

export async function resetPasswordWithTokenAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = consumePasswordResetTokenSchema.safeParse(
    formDataToObject(formData)
  );

  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali password baru.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await consumePasswordResetToken(parsed.data.token, parsed.data.password);

    return {
      success: true,
      message: "Password berhasil diganti. Silakan masuk dengan password baru.",
    };
  } catch {
    return {
      success: false,
      message:
        "Link reset tidak valid, sudah digunakan, dicabut, atau kedaluwarsa.",
    };
  }
}
