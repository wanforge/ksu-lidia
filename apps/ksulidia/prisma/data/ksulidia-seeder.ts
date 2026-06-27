import {
  PrismaClient,
  SavingsType,
  SavingsTxType,
  LoanStatus,
  InstallmentStatus,
} from "@prisma/client";
import fs from "fs";
import path from "path";

type ExtractedMember = {
  no: number;
  name: string;
  s_awal_hutang: number;
  angsuran: number;
  bunga: number;
  denda: number;
  tab_pokok: number;
  tab_wajib: number;
  tab_sukarela: number;
  s_awal_wajib: number;
  pengambilan_wajib: number;
  s_akhir_wajib: number;
  s_awal_sukarela: number;
  pengambilan_sukarela: number;
  s_akhir_sukarela: number;
  pinjaman_baru: number;
  provisi: number;
  cad_resiko_kredit: number;
};

export async function seedKsuLidiaData(prisma: PrismaClient) {
  console.log("📂  Seeding KSU Lidia member data...");

  const dataPath = path.join(__dirname, "extracted_members.json");
  if (!fs.existsSync(dataPath)) {
    console.error(`❌  Extracted members file not found at: ${dataPath}`);
    return;
  }

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const extractedMembers: ExtractedMember[] = JSON.parse(rawData);

  console.log(`Loaded ${extractedMembers.length} members from JSON.`);

  // We will seed in chunks or loop through them
  let memberCount = 0;
  let savingsCount = 0;
  let txCount = 0;
  let loanCount = 0;

  for (const m of extractedMembers) {
    // 1. Create or update Member
    const member = await prisma.member.upsert({
      where: { no: m.no },
      update: {
        name: m.name,
        isActive: true,
      },
      create: {
        no: m.no,
        name: m.name,
        isActive: true,
      },
    });
    memberCount++;

    // 2. Setup Savings Accounts (POKOK, WAJIB, SUKARELA)
    // Pokok savings is usually a fixed 100,000 once when joining
    const hasPokok =
      m.tab_pokok > 0 || m.s_akhir_wajib > 0 || m.s_akhir_sukarela > 0;
    const balancePokok = hasPokok ? 100000 : 0;

    await prisma.savingsAccount.upsert({
      where: {
        memberId_type: { memberId: member.id, type: SavingsType.POKOK },
      },
      update: { balance: balancePokok },
      create: {
        memberId: member.id,
        type: SavingsType.POKOK,
        balance: balancePokok,
      },
    });
    savingsCount++;

    await prisma.savingsAccount.upsert({
      where: {
        memberId_type: { memberId: member.id, type: SavingsType.WAJIB },
      },
      update: { balance: m.s_akhir_wajib },
      create: {
        memberId: member.id,
        type: SavingsType.WAJIB,
        balance: m.s_akhir_wajib,
      },
    });
    savingsCount++;

    await prisma.savingsAccount.upsert({
      where: {
        memberId_type: { memberId: member.id, type: SavingsType.SUKARELA },
      },
      update: { balance: m.s_akhir_sukarela },
      create: {
        memberId: member.id,
        type: SavingsType.SUKARELA,
        balance: m.s_akhir_sukarela,
      },
    });
    savingsCount++;

    // 3. Log Savings Transactions for this month
    if (m.tab_pokok > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.POKOK,
          amount: m.tab_pokok,
          description: "Setoran Simpanan Pokok",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.tab_wajib > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.WAJIB,
          amount: m.tab_wajib,
          description: "Setoran Simpanan Wajib Bulanan",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.tab_sukarela > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.DEPOSIT,
          savingsType: SavingsType.SUKARELA,
          amount: m.tab_sukarela,
          description: "Setoran Simpanan Sukarela",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.pengambilan_wajib > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.WITHDRAWAL,
          savingsType: SavingsType.WAJIB,
          amount: m.pengambilan_wajib,
          description: "Penarikan Simpanan Wajib",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    if (m.pengambilan_sukarela > 0) {
      await prisma.savingsTransaction.create({
        data: {
          memberId: member.id,
          type: SavingsTxType.WITHDRAWAL,
          savingsType: SavingsType.SUKARELA,
          amount: m.pengambilan_sukarela,
          description: "Penarikan Simpanan Sukarela",
          date: new Date("2026-05-05"),
        },
      });
      txCount++;
    }

    // 4. Create Loan if active
    const hasLoan = m.pinjaman_baru > 0 || m.s_awal_hutang > 0;
    if (hasLoan) {
      const isNew = m.pinjaman_baru > 0;
      const loanAmount = isNew ? m.pinjaman_baru : m.s_awal_hutang;
      const provision = isNew ? m.provisi : loanAmount * 0.01;
      const crk = isNew ? m.cad_resiko_kredit : loanAmount * 0.1;
      const receivedAmount = loanAmount - provision - crk;
      const interestRate = 1.0; // 1% flat
      const tenor = 10; // 10 months default
      const installmentAmount =
        loanAmount / tenor + loanAmount * (interestRate / 100);

      const loan = await prisma.loan.create({
        data: {
          memberId: member.id,
          amount: loanAmount,
          interestRate,
          tenor,
          provision,
          crk,
          receivedAmount,
          installmentAmount,
          status: LoanStatus.ACTIVE,
          dateDisbursed: isNew
            ? new Date("2026-05-01")
            : new Date("2026-01-01"),
        },
      });
      loanCount++;

      // Create installments
      for (let i = 1; i <= tenor; i++) {
        const dueDate = new Date(loan.dateDisbursed);
        dueDate.setMonth(dueDate.getMonth() + i);

        // Assume first installment is paid if it was an old loan or if they made a payment this month
        const isPaidThisMonth = i === 1 && (m.angsuran > 0 || m.bunga > 0);

        await prisma.loanInstallment.create({
          data: {
            loanId: loan.id,
            monthNumber: i,
            principalPaid: isPaidThisMonth ? m.angsuran : 0,
            interestPaid: isPaidThisMonth ? m.bunga : 0,
            penaltyPaid: isPaidThisMonth ? m.denda : 0,
            totalPaid: isPaidThisMonth ? m.angsuran + m.bunga + m.denda : 0,
            dueDate,
            paidAt: isPaidThisMonth ? new Date("2026-05-15") : null,
            status: isPaidThisMonth
              ? InstallmentStatus.PAID
              : InstallmentStatus.UNPAID,
          },
        });
      }
    }
  }

  console.log(
    `✅  Seeded: ${memberCount} Members, ${savingsCount} Savings Accounts, ${txCount} Savings Transactions, ${loanCount} Loans.`
  );

  // 5. Seed Toko Lidia Products & Transactions
  console.log("🛒  Seeding Toko Lidia products & P&L matching data...");
  await prisma.productTransactionItem.deleteMany();
  await prisma.productTransaction.deleteMany();
  await prisma.product.deleteMany();

  const dummyProducts = [
    {
      code: "BRS-01",
      name: "Beras Ramos Premium 5kg",
      category: "Sembako",
      stock: 120,
      purchasePrice: 65000,
      sellingPrice: 72000,
    },
    {
      code: "MYK-01",
      name: "Minyak Goreng Bimoli 2L",
      category: "Sembako",
      stock: 85,
      purchasePrice: 32000,
      sellingPrice: 36000,
    },
    {
      code: "GLA-01",
      name: "Gula Pasir Gulaku 1kg",
      category: "Sembako",
      stock: 150,
      purchasePrice: 15000,
      sellingPrice: 17500,
    },
    {
      code: "TEH-01",
      name: "Teh Celup Sariwangi 25s",
      category: "Minuman",
      stock: 200,
      purchasePrice: 6000,
      sellingPrice: 7500,
    },
    {
      code: "KPI-01",
      name: "Kopi Kapal Api Special 165g",
      category: "Minuman",
      stock: 110,
      purchasePrice: 12000,
      sellingPrice: 14000,
    },
    {
      code: "SSU-01",
      name: "Susu Kental Manis Indomilk",
      category: "Minuman",
      stock: 95,
      purchasePrice: 11000,
      sellingPrice: 12500,
    },
    {
      code: "IND-01",
      name: "Indomie Goreng (Dus)",
      category: "Sembako",
      stock: 45,
      purchasePrice: 102000,
      sellingPrice: 115000,
    },
    {
      code: "RNS-01",
      name: "Rinso Anti Noda 770g",
      category: "Rumah Tangga",
      stock: 60,
      purchasePrice: 18000,
      sellingPrice: 21000,
    },
    {
      code: "LFB-01",
      name: "Sabun Mandi Lifebuoy 85g",
      category: "Rumah Tangga",
      stock: 300,
      purchasePrice: 3500,
      sellingPrice: 4500,
    },
    {
      code: "PPS-01",
      name: "Pasta Gigi Pepsodent 190g",
      category: "Rumah Tangga",
      stock: 140,
      purchasePrice: 12000,
      sellingPrice: 14500,
    },
  ];

  const createdProducts: any[] = [];
  for (const p of dummyProducts) {
    const prod = await prisma.product.create({
      data: p,
    });
    createdProducts.push(prod);
  }
  console.log(`Seeded ${createdProducts.length} base products.`);

  // January Sales: 11,052,000
  const janSaleTx = await prisma.productTransaction.create({
    data: {
      type: "SALE",
      totalAmount: 11052000,
      notes: "Penjualan Toko KSU Lidia - Akumulasi Januari 2026",
      date: new Date("2026-01-28"),
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: janSaleTx.id,
      productId: createdProducts.find((p) => p.code === "IND-01").id,
      quantity: 96,
      unitPrice: 115000,
      totalPrice: 11040000,
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: janSaleTx.id,
      productId: createdProducts.find((p) => p.code === "GLA-01").id,
      quantity: 4,
      unitPrice: 3000, // custom price/discount for remaining
      totalPrice: 12000,
    },
  });

  // January Purchases: 10,913,741
  const janPurchTx = await prisma.productTransaction.create({
    data: {
      type: "PURCHASE",
      totalAmount: 10913741,
      notes: "Kulakan Stok Barang - Januari 2026",
      date: new Date("2026-01-05"),
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: janPurchTx.id,
      productId: createdProducts.find((p) => p.code === "IND-01").id,
      quantity: 107,
      unitPrice: 102000,
      totalPrice: 10914000, // approx matching
    },
  });

  // February Sales: 6,399,000
  const febSaleTx = await prisma.productTransaction.create({
    data: {
      type: "SALE",
      totalAmount: 6399000,
      notes: "Penjualan Toko KSU Lidia - Akumulasi Februari 2026",
      date: new Date("2026-02-25"),
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: febSaleTx.id,
      productId: createdProducts.find((p) => p.code === "BRS-01").id,
      quantity: 80,
      unitPrice: 72000,
      totalPrice: 5760000,
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: febSaleTx.id,
      productId: createdProducts.find((p) => p.code === "MYK-01").id,
      quantity: 17,
      unitPrice: 36000,
      totalPrice: 612000,
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: febSaleTx.id,
      productId: createdProducts.find((p) => p.code === "TEH-01").id,
      quantity: 3,
      unitPrice: 9000,
      totalPrice: 27000,
    },
  });

  // February Purchases: 4,365,033
  const febPurchTx = await prisma.productTransaction.create({
    data: {
      type: "PURCHASE",
      totalAmount: 4365033,
      notes: "Kulakan Stok Barang - Februari 2026",
      date: new Date("2026-02-05"),
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: febPurchTx.id,
      productId: createdProducts.find((p) => p.code === "BRS-01").id,
      quantity: 67,
      unitPrice: 65000,
      totalPrice: 4355000,
    },
  });

  // March Sales: 10,565,000
  const marSaleTx = await prisma.productTransaction.create({
    data: {
      type: "SALE",
      totalAmount: 10565000,
      notes: "Penjualan Toko KSU Lidia - Akumulasi Maret 2026",
      date: new Date("2026-03-25"),
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: marSaleTx.id,
      productId: createdProducts.find((p) => p.code === "GLA-01").id,
      quantity: 600,
      unitPrice: 17500,
      totalPrice: 10500000,
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: marSaleTx.id,
      productId: createdProducts.find((p) => p.code === "KPI-01").id,
      quantity: 4,
      unitPrice: 14000,
      totalPrice: 56000,
    },
  });
  await prisma.productTransactionItem.create({
    data: {
      transactionId: marSaleTx.id,
      productId: createdProducts.find((p) => p.code === "SSU-01").id,
      quantity: 0.72, // adjust for remaining
      unitPrice: 12500,
      totalPrice: 9000,
    },
  });

  console.log("✅  Seeded store transactions matching Triannual Excel.");
}
