import { PrismaClient } from "@prisma/client";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";

export async function seedLaporanToko(prisma: PrismaClient) {
  console.log("🛒 Seeding Laporan Toko...");

  const dataPath = path.join(__dirname, "../../../../docs/DATA_DARI_USER/DATA DARI USER UNTUK BUAT SISTEM/Lap Rugi laba 1 Jan sd 31 Maret 2026 (LAPORAN TRIWULAN TOKO).xlsx");
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Excel file not found at: ${dataPath}`);
    return;
  }

  // The previous implementation used dummy products because the P&L didn't list item-by-item transactions,
  // it only had accumulated totals. Let's recreate the dummy data here, but note that if the Excel file
  // has actual product data, we could parse it here.
  // For now, we replicate the dummy approach but placed inside this specific seeder file.
  
  await prisma.productTransactionItem.deleteMany();
  await prisma.productTransaction.deleteMany();
  await prisma.product.deleteMany();

  const dummyProducts = [
    { code: "BRS-01", name: "Beras Ramos Premium 5kg", category: "Sembako", stock: 120, purchasePrice: 65000, sellingPrice: 72000 },
    { code: "MYK-01", name: "Minyak Goreng Bimoli 2L", category: "Sembako", stock: 85, purchasePrice: 32000, sellingPrice: 36000 },
    { code: "GLA-01", name: "Gula Pasir Gulaku 1kg", category: "Sembako", stock: 150, purchasePrice: 15000, sellingPrice: 17500 },
    { code: "TEH-01", name: "Teh Celup Sariwangi 25s", category: "Minuman", stock: 200, purchasePrice: 6000, sellingPrice: 7500 },
    { code: "KPI-01", name: "Kopi Kapal Api Special 165g", category: "Minuman", stock: 110, purchasePrice: 12000, sellingPrice: 14000 },
    { code: "SSU-01", name: "Susu Kental Manis Indomilk", category: "Minuman", stock: 95, purchasePrice: 11000, sellingPrice: 12500 },
    { code: "IND-01", name: "Indomie Goreng (Dus)", category: "Sembako", stock: 45, purchasePrice: 102000, sellingPrice: 115000 },
    { code: "RNS-01", name: "Rinso Anti Noda 770g", category: "Rumah Tangga", stock: 60, purchasePrice: 18000, sellingPrice: 21000 },
    { code: "LFB-01", name: "Sabun Mandi Lifebuoy 85g", category: "Rumah Tangga", stock: 300, purchasePrice: 3500, sellingPrice: 4500 },
    { code: "PPS-01", name: "Pasta Gigi Pepsodent 190g", category: "Rumah Tangga", stock: 140, purchasePrice: 12000, sellingPrice: 14500 },
  ];

  const createdProducts: any[] = [];
  for (const p of dummyProducts) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }

  // January
  const janSaleTx = await prisma.productTransaction.create({
    data: { type: "SALE", totalAmount: 11052000, notes: "Penjualan Toko KSU Lidia - Akumulasi Januari 2026", date: new Date("2026-01-28") },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: janSaleTx.id, productId: createdProducts.find(p => p.code === "IND-01").id, quantity: 96, unitPrice: 115000, totalPrice: 11040000 },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: janSaleTx.id, productId: createdProducts.find(p => p.code === "GLA-01").id, quantity: 4, unitPrice: 3000, totalPrice: 12000 },
  });

  const janPurchTx = await prisma.productTransaction.create({
    data: { type: "PURCHASE", totalAmount: 10913741, notes: "Kulakan Stok Barang - Januari 2026", date: new Date("2026-01-05") },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: janPurchTx.id, productId: createdProducts.find(p => p.code === "IND-01").id, quantity: 107, unitPrice: 102000, totalPrice: 10914000 },
  });

  // February
  const febSaleTx = await prisma.productTransaction.create({
    data: { type: "SALE", totalAmount: 6399000, notes: "Penjualan Toko KSU Lidia - Akumulasi Februari 2026", date: new Date("2026-02-25") },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: febSaleTx.id, productId: createdProducts.find(p => p.code === "BRS-01").id, quantity: 80, unitPrice: 72000, totalPrice: 5760000 },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: febSaleTx.id, productId: createdProducts.find(p => p.code === "MYK-01").id, quantity: 17, unitPrice: 36000, totalPrice: 612000 },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: febSaleTx.id, productId: createdProducts.find(p => p.code === "TEH-01").id, quantity: 3, unitPrice: 9000, totalPrice: 27000 },
  });

  const febPurchTx = await prisma.productTransaction.create({
    data: { type: "PURCHASE", totalAmount: 4365033, notes: "Kulakan Stok Barang - Februari 2026", date: new Date("2026-02-05") },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: febPurchTx.id, productId: createdProducts.find(p => p.code === "BRS-01").id, quantity: 67, unitPrice: 65000, totalPrice: 4355000 },
  });

  // March
  const marSaleTx = await prisma.productTransaction.create({
    data: { type: "SALE", totalAmount: 10565000, notes: "Penjualan Toko KSU Lidia - Akumulasi Maret 2026", date: new Date("2026-03-25") },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: marSaleTx.id, productId: createdProducts.find(p => p.code === "GLA-01").id, quantity: 600, unitPrice: 17500, totalPrice: 10500000 },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: marSaleTx.id, productId: createdProducts.find(p => p.code === "KPI-01").id, quantity: 4, unitPrice: 14000, totalPrice: 56000 },
  });
  await prisma.productTransactionItem.create({
    data: { transactionId: marSaleTx.id, productId: createdProducts.find(p => p.code === "SSU-01").id, quantity: 0.72, unitPrice: 12500, totalPrice: 9000 },
  });

  console.log("✅ Seeded Toko Lidia transactions.");
}
