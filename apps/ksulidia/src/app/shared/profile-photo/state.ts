// Type state untuk action foto profil akun (modul biasa, bukan "use server").
export type PhotoActionState = {
  success: boolean;
  message: string;
};

export const initialPhotoActionState: PhotoActionState = {
  success: false,
  message: "",
};
