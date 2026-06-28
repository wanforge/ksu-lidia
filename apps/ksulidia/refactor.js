const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, 'src/app/(hydrogen)/simpan-pinjam/anggota/anggota-workspace.tsx'),
  path.join(__dirname, 'src/app/(hydrogen)/simpan-pinjam/pinjaman/pinjaman-workspace.tsx')
];

for (const filePath of filePaths) {
  if (!fs.existsSync(filePath)) {
    console.error('Not found:', filePath);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import Table
  if (!content.includes('import { Table }')) {
    content = content.replace(
      'import { Button } from "@/components/ui/button";',
      'import { Button } from "@/components/ui/button";\nimport { Table } from "rizzui";'
    );
  }

  // Replace table
  let searchString = '<table className="min-w-full divide-y divide-gray-200 text-sm">';
  let tableStart = content.indexOf(searchString);

  while (tableStart > -1) {
    let tableEnd = content.indexOf('</table>', tableStart) + 8;
    if (tableEnd > 7) { // found
      let table = content.substring(tableStart, tableEnd);
      table = table.replace(/<table className="min-w-full divide-y divide-gray-200 text-sm">/g, '<Table className="min-w-full">');
      table = table.replace(/<\/table>/g, '</Table>');
      table = table.replace(/<thead className="bg-gray-50">/g, '<Table.Header>');
      table = table.replace(/<\/thead>/g, '</Table.Header>');
      table = table.replace(/<tbody className="divide-y divide-gray-100">/g, '<Table.Body>');
      table = table.replace(/<\/tbody>/g, '</Table.Body>');
      table = table.replace(/<tr/g, '<Table.Row');
      table = table.replace(/<\/tr>/g, '</Table.Row>');
      table = table.replace(/<th className="[^"]*">/g, '<Table.Head>');
      table = table.replace(/<\/th>/g, '</Table.Head>');
      table = table.replace(/<td className="[^"]*">/g, '<Table.Cell>');
      table = table.replace(/<td/g, '<Table.Cell'); // For cases with colSpan etc.
      table = table.replace(/<\/td>/g, '</Table.Cell>');
      content = content.substring(0, tableStart) + table + content.substring(tableEnd);
      tableStart = content.indexOf(searchString, tableStart + table.length);
    } else {
      break;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully refactored', filePath);
}
