import fs from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "src/lib/settings.json");

export type SystemSettings = {
  profile: {
    name: string;
    address: string;
    phone: string;
  };
  financial: {
    defaultInterestRate: number;
    defaultPenaltyRate: number;
    adminFee: number;
  };
};

export function getSettings(): SystemSettings {
  try {
    const data = fs.readFileSync(settingsPath, "utf-8");
    return JSON.parse(data) as SystemSettings;
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      profile: {
        name: "KSU LIDIA",
        address: "Jl. Contoh Alamat No. 123",
        phone: "(021) 1234567",
      },
      financial: {
        defaultInterestRate: 1.5,
        defaultPenaltyRate: 5.0,
        adminFee: 10000,
      },
    };
  }
}

export function saveSettings(newSettings: SystemSettings) {
  fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), "utf-8");
}
