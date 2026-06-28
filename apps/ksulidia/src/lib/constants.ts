export const APP_SETTING_KEYS = {
  DEFAULT_INTEREST_RATE: "DEFAULT_INTEREST_RATE",
  DEFAULT_PENALTY_RATE: "DEFAULT_PENALTY_RATE",
  PROVISION_RATE: "PROVISION_RATE",
  CRK_RATE: "CRK_RATE",
  MIN_POKOK: "MIN_POKOK",
  WAJIB_MONTHLY: "WAJIB_MONTHLY",
  COOP_NAME: "COOP_NAME",
  COOP_ADDRESS: "COOP_ADDRESS",
} as const;

export const DB_ROLES = {
  ADMIN: "ADMIN",
  VIEWER: "VIEWER",
} as const;

export const SAVINGS_TYPES = {
  POKOK: "POKOK",
  WAJIB: "WAJIB",
  SUKARELA: "SUKARELA",
} as const;

export const SAVINGS_TX_TYPES = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
} as const;

export const LOAN_STATUS = {
  ACTIVE: "ACTIVE",
  PAID: "PAID",
  DEFAULTED: "DEFAULTED",
} as const;

export const INSTALLMENT_STATUS = {
  UNPAID: "UNPAID",
  PAID: "PAID",
  LATE: "LATE",
} as const;

export const CASH_ENTITIES = {
  KOPERASI: "KOPERASI",
  TOKO: "TOKO",
  SRI_NETHERLAND: "SRI_NETHERLAND",
} as const;

export const CASH_TX_TYPES = {
  IN: "IN",
  OUT: "OUT",
} as const;

export const FINANCIAL_REPORT_ENTITIES = {
  KSP: "KSP",
  TOKO: "TOKO",
  KONSOLIDASI: "KONSOLIDASI",
} as const;

export const FINANCIAL_REPORT_TYPES = {
  NERACA: "NERACA",
  RUGI_LABA: "RUGI_LABA",
  PAJAK: "PAJAK",
} as const;

// Common Options for Select Dropdowns
export const ROLE_OPTIONS = [
  { label: "Administrator", value: DB_ROLES.ADMIN },
  { label: "Viewer", value: DB_ROLES.VIEWER },
];

export const SAVINGS_TYPE_OPTIONS = [
  { label: "Simpanan Pokok", value: SAVINGS_TYPES.POKOK },
  { label: "Simpanan Wajib", value: SAVINGS_TYPES.WAJIB },
  { label: "Simpanan Sukarela", value: SAVINGS_TYPES.SUKARELA },
];

export const CASH_ENTITY_OPTIONS = [
  { label: "Koperasi", value: CASH_ENTITIES.KOPERASI },
  { label: "Toko Lidia", value: CASH_ENTITIES.TOKO },
  { label: "Sri Netherland (External)", value: CASH_ENTITIES.SRI_NETHERLAND },
];
