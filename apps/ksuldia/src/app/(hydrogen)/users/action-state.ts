// Plain module (NOT "use server"): a "use server" file may only export async
// functions, so the action state type + initial value live here and are
// imported by both the actions and the client forms.
export type UserActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  resetLink?: string;
  expiresAt?: string;
};

export const initialUserActionState: UserActionState = {
  success: false,
  message: "",
};
