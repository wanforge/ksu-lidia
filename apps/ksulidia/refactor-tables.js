const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "src/app/(hydrogen)/users/users-workspace.tsx",
  "src/app/(hydrogen)/audit/page.tsx",
  "src/app/(hydrogen)/log-perubahan/page.tsx",
  "src/app/(hydrogen)/sistem/system-dashboard.tsx",
  "src/app/(hydrogen)/toko/produk/produk-workspace.tsx",
  "src/app/(hydrogen)/toko/transaksi/transaksi-workspace.tsx",
  "src/app/(hydrogen)/statistik/statistik-dashboard.tsx",
  "src/app/(hydrogen)/laporan/laporan-workspace.tsx"
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing file: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Replace <table ...> with <Table variant="modern" ...>
  // Regex to match <table className="..." ...> and replace with <Table variant="modern" className="..." ...>
  // Also </table> with </Table>
  
  if (content.includes('<table')) {
    content = content.replace(/<table/g, '<Table variant="modern"');
    content = content.replace(/<\/table>/g, '</Table>');
    
    // Add import { Table } from "rizzui"; if not exists
    if (!content.includes('import { Table } from "rizzui";') && !content.includes('import {Table} from "rizzui";')) {
        const importStatement = `import { Table } from "rizzui";\n`;
        // insert after first import or at top
        const lines = content.split('\n');
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
             insertIndex = i + 1;
          }
        }
        if (insertIndex > 0) {
            lines.splice(insertIndex, 0, importStatement.trim());
            content = lines.join('\n');
        } else {
            content = importStatement + content;
        }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
  }
});
