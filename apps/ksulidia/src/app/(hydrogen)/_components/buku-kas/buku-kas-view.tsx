"use client";

import { useActionState, useState } from "react";
import { CashEntity, CashTxType } from "@prisma/client";
import { formatNumber } from "@/lib/format";
import dayjs from "dayjs";
import { Table } from "rizzui";
import { Button } from "@/components/ui/button";
import { PiPlusBold, PiXBold } from "react-icons/pi";
import { createCashTransactionAction, CashActionState } from "./actions";
import { useActionFeedback } from "@/app/shared/use-action-feedback";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txState, dispatchTx] = useActionState<CashActionState, FormData>(
    createCashTransactionAction,
    { success: false, message: "" }
  );

  useActionFeedback(txState, () => {
    setIsModalOpen(false);
  });

  const title =
    entity === CashEntity.KOPERASI ? "Buku Kas Koperasi" : "Buku Kas Toko";

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
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
        <div className="shrink-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800"
          >
            <PiPlusBold className="h-4 w-4" />
            Tambah Transaksi Kas
          </Button>
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

      {/* Modal Tambah Transaksi Kas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-5 w-5" />
            </button>

            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Tambah Transaksi Kas Manual
            </h3>

            <form action={dispatchTx} className="space-y-4">
              <input type="hidden" name="entity" value={entity} />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jenis Mutasi
                </label>
                <select
                  name="type"
                  defaultValue={CashTxType.OUT}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                >
                  <option value={CashTxType.OUT}>Pengeluaran (Kredit)</option>
                  <option value={CashTxType.IN}>Penerimaan (Debit)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Tentukan apakah ini uang masuk atau keluar.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nominal (Rupiah)
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min={100}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                {txState.errors?.amount && (
                  <p className="mt-1 text-xs text-red-600">
                    {txState.errors.amount[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Keterangan
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="Misal: Beli ATK, Bayar Listrik, dll"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
                {txState.errors?.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {txState.errors.description[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  No. Referensi / Bukti (Opsional)
                </label>
                <input
                  type="text"
                  name="referenceNo"
                  placeholder="Misal: INV-2023/001"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Catat Transaksi</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
