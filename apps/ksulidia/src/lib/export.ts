// ponytail: PDF rendered client-side — large datasets (>5000 rows) may lag.
// Upgrade: stream to server action for PDF generation if needed.

type ExportColumn = { label: string; key: string };

function getField(obj: Record<string, any>, key: string): string {
  const val = key
    .split(".")
    .reduce((acc: any, part) => acc?.[part] ?? "", obj);
  return val === null || val === undefined ? "" : String(val);
}

export function exportToCsv(
  filename: string,
  columns: ExportColumn[],
  rows: Record<string, any>[]
) {
  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => `"${getField(row, c.key).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const csv = "data:text/csv;charset=utf-8,﻿" + header + "\n" + body;
  trigger(encodeURI(csv), `${filename}.csv`);
}

export function exportToExcel(
  filename: string,
  columns: ExportColumn[],
  rows: Record<string, any>[]
) {
  import("xlsx").then(({ utils, writeFile }) => {
    const data = rows.map((row) =>
      Object.fromEntries(columns.map((c) => [c.label, getField(row, c.key)]))
    );
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(wb, `${filename}.xlsx`);
  });
}

export function exportToPdf(
  filename: string,
  columns: ExportColumn[],
  rows: Record<string, any>[],
  title?: string
) {
  import("jspdf").then(({ jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF({ orientation: "landscape" });
      if (title) {
        doc.setFontSize(14);
        doc.text(title, 14, 15);
      }
      autoTable(doc, {
        head: [columns.map((c) => c.label)],
        body: rows.map((row) => columns.map((c) => getField(row, c.key))),
        startY: title ? 22 : 14,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [180, 0, 0] },
      });
      doc.save(`${filename}.pdf`);
    });
  });
}

function trigger(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
