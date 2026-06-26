"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const configPath = path.join(process.cwd(), "src/config/cooperative.json");

export type MasterConfig = {
  interestRate: number;
  provisionRate: number;
  crkRate: number;
  penaltyRate: number;
  minPokok: number;
  wajibMonthly: number;
  cooperativeName: string;
  cooperativeAddress: string;
};

export type MasterActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateMasterConfigAction(
  prevState: MasterActionState,
  formData: FormData
): Promise<MasterActionState> {
  try {
    const interestRate = parseFloat(formData.get("interestRate") as string) || 0;
    const provisionRate = parseFloat(formData.get("provisionRate") as string) || 0;
    const crkRate = parseFloat(formData.get("crkRate") as string) || 0;
    const penaltyRate = parseFloat(formData.get("penaltyRate") as string) || 0;
    const minPokok = parseInt(formData.get("minPokok") as string, 10) || 0;
    const wajibMonthly = parseInt(formData.get("wajibMonthly") as string, 10) || 0;
    const cooperativeName = (formData.get("cooperativeName") as string) || "";
    const cooperativeAddress = (formData.get("cooperativeAddress") as string) || "";

    const updatedConfig: MasterConfig = {
      interestRate,
      provisionRate,
      crkRate,
      penaltyRate,
      minPokok,
      wajibMonthly,
      cooperativeName,
      cooperativeAddress,
    };

    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");

    revalidatePath("/simpan-pinjam/master");
    revalidatePath("/statistik");
    revalidatePath("/laporan");
    revalidatePath("/");

    return {
      success: true,
      message: "Konfigurasi master berhasil disimpan dan diperbarui.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal memperbarui konfigurasi: ${error.message}`,
    };
  }
}
