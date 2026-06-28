"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { ensureAuditContext } from "@/lib/audit-context";
import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { AuditAction, AttachmentSource } from "@prisma/client";
import { APP_SETTING_KEYS } from "@/lib/constants";

export type MasterActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export type MasterConfig = {
  cooperativeName: string;
  cooperativeAddress: string;
  minPokok: number;
  wajibMonthly: number;
  interestRate: number;
  provisionRate: number;
  crkRate: number;
  penaltyRate: number;
};

export async function updateMasterConfigAction(
  prevState: MasterActionState,
  formData: FormData
): Promise<MasterActionState> {
  const session = await getSession();
  ensureAuditContext(
    session?.user
      ? { actorId: session.user.id, actorRole: session.user.role }
      : undefined
  );

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      success: false,
      message: "Hanya administrator yang berwenang memperbarui konfigurasi.",
    };
  }

  try {
    const interestRate = (formData.get("interestRate") as string) || "1.50";
    const provisionRate = (formData.get("provisionRate") as string) || "100.00";
    const crkRate = (formData.get("crkRate") as string) || "10.00";
    const penaltyRate = (formData.get("penaltyRate") as string) || "5.00";
    const minPokok = (formData.get("minPokok") as string) || "100000";
    const wajibMonthly = (formData.get("wajibMonthly") as string) || "10000";
    const cooperativeName = (formData.get("cooperativeName") as string) || "";
    const cooperativeAddress =
      (formData.get("cooperativeAddress") as string) || "";

    const entries = [
      {
        key: APP_SETTING_KEYS.DEFAULT_INTEREST_RATE,
        value: interestRate,
        desc: "Bunga Pinjaman Default (%)",
      },
      {
        key: APP_SETTING_KEYS.DEFAULT_PENALTY_RATE,
        value: penaltyRate,
        desc: "Denda Keterlambatan Default (%)",
      },
      {
        key: APP_SETTING_KEYS.PROVISION_RATE,
        value: provisionRate,
        desc: "Provisi (Persentase thd nominal Bunga)",
      },
      {
        key: APP_SETTING_KEYS.CRK_RATE,
        value: crkRate,
        desc: "Cadangan Risiko Kredit (Persentase thd total pinjaman)",
      },
      {
        key: APP_SETTING_KEYS.MIN_POKOK,
        value: minPokok,
        desc: "Simpanan Pokok Minimum",
      },
      {
        key: APP_SETTING_KEYS.WAJIB_MONTHLY,
        value: wajibMonthly,
        desc: "Simpanan Wajib Bulanan",
      },
      {
        key: APP_SETTING_KEYS.COOP_NAME,
        value: cooperativeName,
        desc: "Nama Koperasi",
      },
      {
        key: APP_SETTING_KEYS.COOP_ADDRESS,
        value: cooperativeAddress,
        desc: "Alamat Koperasi",
      },
    ];

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.appSetting.upsert({
          where: { key: entry.key },
          update: { value: entry.value, description: entry.desc },
          create: {
            key: entry.key,
            value: entry.value,
            description: entry.desc,
          },
        })
      )
    );

    await recordAuditLog(prisma, {
      actorId: session.user.id,
      actorRole: session.user.role as any,
      action: AuditAction.UPDATE,
      entityType: "AppSetting",
      entityId: "cooperative-config",
      summary: `Memperbarui parameter koperasi: ${cooperativeName}`,
      source: AttachmentSource.BACK_OFFICE,
    });

    revalidatePath("/simpan-pinjam/master");
    revalidatePath("/simpan-pinjam/pinjaman");
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
