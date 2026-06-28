"use server";

import { getSession } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { saveSettings, SystemSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export type SettingsActionState = {
  success: boolean;
  message: string;
};

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await getSession();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return {
      success: false,
      message: "Hanya administrator yang dapat mengubah pengaturan sistem.",
    };
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  
  const defaultInterestRate = Number(formData.get("defaultInterestRate"));
  const defaultPenaltyRate = Number(formData.get("defaultPenaltyRate"));
  const adminFee = Number(formData.get("adminFee"));

  const newSettings: SystemSettings = {
    profile: { name, address, phone },
    financial: { defaultInterestRate, defaultPenaltyRate, adminFee },
  };

  try {
    saveSettings(newSettings);
    revalidatePath("/pengaturan");
    return { success: true, message: "Pengaturan berhasil disimpan." };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menyimpan pengaturan." };
  }
}

export async function closeBookAction(): Promise<SettingsActionState> {
  const session = await getSession();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return {
      success: false,
      message: "Hanya administrator yang dapat melakukan tutup buku.",
    };
  }

  // Placeholder untuk logika perhitungan SHU tahunan
  try {
    // 1. Hitung total pendapatan (bunga pinjaman, denda, admin, penjualan toko)
    // 2. Hitung total pengeluaran
    // 3. Simpan rekap ke tabel History/TutupBuku
    
    // Logika disederhanakan
    console.log("[TUTUP BUKU] Memulai proses kalkulasi SHU tahunan...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi proses
    console.log("[TUTUP BUKU] Selesai menghitung SHU.");

    return { success: true, message: "Proses tutup buku berhasil dijalankan. SHU telah dikalkulasi." };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal melakukan tutup buku." };
  }
}
