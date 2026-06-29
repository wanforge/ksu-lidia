import { z } from "zod";
import {
  SavingsType,
  SavingsTxType,
  LoanStatus,
  InstallmentStatus,
  ProductTxType,
  CashEntity,
  CashTxType,
} from "@prisma/client";

export const createMemberSchema = z.object({
  no: z.coerce
    .number()
    .int()
    .positive("Nomor anggota harus bilangan bulat positif"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const updateMemberSchema = z.object({
  memberId: z.string().uuid("ID anggota tidak valid"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const savingsTransactionSchema = z.object({
  memberId: z.string().uuid("ID anggota tidak valid"),
  type: z.nativeEnum(SavingsTxType),
  savingsType: z.nativeEnum(SavingsType),
  amount: z.coerce.number().positive("Nomor harus bernilai positif"),
  description: z.string().optional(),
  transactionDate: z.coerce.date().optional(),
});

export const createLoanSchema = z.object({
  memberId: z.string().uuid("ID anggota tidak valid"),
  amount: z.coerce.number().positive("Jumlah pinjaman harus bernilai positif"),
  interestRate: z.coerce.number().nonnegative("Suku bunga tidak boleh negatif"),
  provisionRate: z.coerce
    .number()
    .nonnegative("Persentase provisi tidak boleh negatif"),
  crkRate: z.coerce.number().nonnegative("Persentase CRK tidak boleh negatif"),
  penaltyRate: z.coerce
    .number()
    .nonnegative("Persentase denda tidak boleh negatif"),
  tenor: z.coerce.number().int().positive("Tenor harus minimal 1 bulan"),
});

export const payInstallmentSchema = z.object({
  installmentId: z.string().uuid("ID angsuran tidak valid"),
  principalPaid: z.coerce
    .number()
    .nonnegative("Pokok dibayar tidak boleh negatif"),
  interestPaid: z.coerce
    .number()
    .nonnegative("Bunga dibayar tidak boleh negatif"),
  penaltyPaid: z.coerce
    .number()
    .nonnegative("Denda dibayar tidak boleh negatif"),
});

export const createProductSchema = z.object({
  code: z.string().min(2, "Kode minimal 2 karakter"),
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  category: z.string().optional(),
  stock: z.coerce.number().int().nonnegative("Stok awal tidak boleh negatif"),
  minStock: z.coerce.number().int().nonnegative("Minimal stok tidak boleh negatif").default(5),
  purchasePrice: z.coerce
    .number()
    .nonnegative("Harga beli tidak boleh negatif"),
  sellingPrice: z.coerce.number().nonnegative("Harga jual tidak boleh negatif"),
});

export const updateProductSchema = z.object({
  productId: z.string().uuid("ID produk tidak valid"),
  code: z.string().min(2, "Kode minimal 2 karakter"),
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  category: z.string().optional(),
  minStock: z.coerce.number().int().nonnegative("Minimal stok tidak boleh negatif").default(5),
  purchasePrice: z.coerce
    .number()
    .nonnegative("Harga beli tidak boleh negatif"),
  sellingPrice: z.coerce.number().nonnegative("Harga jual tidak boleh negatif"),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid("ID produk tidak valid"),
  quantity: z.coerce.number().int("Jumlah penyesuaian harus bilangan bulat"),
  reason: z.string().min(2, "Alasan penyesuaian wajib diisi"),
});

export const createProductTransactionItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createProductTransactionSchema = z.object({
  type: z.nativeEnum(ProductTxType),
  notes: z.string().optional(),
  items: z
    .array(createProductTransactionItemSchema)
    .min(1, "Minimal pilih 1 item"),
});

export const cashTransactionSchema = z.object({
  entity: z.nativeEnum(CashEntity),
  type: z.nativeEnum(CashTxType),
  amount: z.coerce.number().positive("Nominal harus bernilai positif"),
  description: z.string().min(3, "Keterangan minimal 3 karakter"),
  referenceNo: z.string().optional(),
});
