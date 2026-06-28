"use client";

import { CashEntity } from "@prisma/client";
import { formatNumber } from "@/lib/format";
import dayjs from "dayjs";
import { Table } from "rizzui";

type BukuKasViewProps = {
  entity: CashEntity;
  transactions: {
    id: string;
    date: Date;
    description: string;
    amount: number;
    transactionType: "DEBIT" | "CREDIT";
    balance: number;
    referenceNo?: string | null;
  }[];
};

export default function BukuKasView({
  entity,
  transactions,
}: BukuKasViewProps) {
  const title =
    entity === CashEntity.KOPERASI ? "Buku Kas Koperasi" : "Buku Kas Toko";

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
            {entity === CashEntity.KOPERASI ? "Simpan Pinjam" : "Toko Lidia"}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Riwayat arus kas masuk (penerimaan) dan kas keluar (pengeluaran).
          </p>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Table className="min-w-full">
          <Table.Header>
            <Table.Row>
              <Table.Head className="whitespace-nowrap">Tanggal</Table.Head>
              <Table.Head>Keterangan</Table.Head>
              <Table.Head className="whitespace-nowrap">
                No. Referensi
              </Table.Head>
              <Table.Head className="whitespace-nowrap text-right">
                Penerimaan (Debit)
              </Table.Head>
              <Table.Head className="whitespace-nowrap text-right">
                Pengeluaran (Kredit)
              </Table.Head>
              <Table.Head className="whitespace-nowrap text-right font-bold">
                Saldo Akhir
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transactions.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={6}
                  className="py-8 text-center text-gray-500"
                >
                  Belum ada transaksi di Buku Kas ini.
                </Table.Cell>
              </Table.Row>
            ) : (
              transactions.map((tx) => (
                <Table.Row key={tx.id}>
                  <Table.Cell className="whitespace-nowrap text-sm text-gray-700">
                    {dayjs(tx.date).format("DD MMM YYYY")}
                  </Table.Cell>
                  <Table.Cell className="text-sm font-medium text-gray-900">
                    {tx.description}
                  </Table.Cell>
                  <Table.Cell className="text-sm text-gray-500">
                    {tx.referenceNo || "-"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-right text-sm font-medium text-green-700">
                    {tx.transactionType === "DEBIT"
                      ? `Rp ${formatNumber(tx.amount)}`
                      : "-"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-right text-sm font-medium text-red-700">
                    {tx.transactionType === "CREDIT"
                      ? `Rp ${formatNumber(tx.amount)}`
                      : "-"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    Rp {formatNumber(tx.balance)}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
