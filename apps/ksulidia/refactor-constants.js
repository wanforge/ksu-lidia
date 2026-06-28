const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /"POKOK"/g, replace: 'SAVINGS_TYPES.POKOK', import: 'SAVINGS_TYPES' },
  { search: /"WAJIB"/g, replace: 'SAVINGS_TYPES.WAJIB', import: 'SAVINGS_TYPES' },
  { search: /"SUKARELA"/g, replace: 'SAVINGS_TYPES.SUKARELA', import: 'SAVINGS_TYPES' },
  { search: /"ACTIVE"/g, replace: 'LOAN_STATUS.ACTIVE', import: 'LOAN_STATUS' },
  { search: /"PAID"/g, replace: 'INSTALLMENT_STATUS.PAID', import: 'INSTALLMENT_STATUS' },
  { search: /"UNPAID"/g, replace: 'INSTALLMENT_STATUS.UNPAID', import: 'INSTALLMENT_STATUS' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let importsNeeded = new Set();

  replacements.forEach(r => {
    if (r.search.test(content)) {
      content = content.replace(r.search, r.replace);
      importsNeeded.add(r.import);
    }
  });

  if (content !== originalContent) {
    // Add import statement if needed
    if (importsNeeded.size > 0) {
      const importsStr = Array.from(importsNeeded).join(', ');
      
      // Determine relative path to @/lib/constants
      // All paths are inside src/app/
      // we can just use @/lib/constants
      
      const importStatement = `import { ${importsStr} } from "@/lib/constants";\n`;
      
      // check if we already have imports from @/lib/constants
      const existingImportRegex = /import\s+{[^}]+}\s+from\s+["']@\/lib\/constants["'];/g;
      const match = existingImportRegex.exec(content);
      
      if (match) {
        // we might just append if not there, for simplicity just let eslint or manual fix handle minor import dups
        // but let's try to do it properly: just insert the new import at the top
        content = importStatement + content;
      } else {
        // Find last import
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIdx = i;
          }
        }
        if (lastImportIdx !== -1) {
          lines.splice(lastImportIdx + 1, 0, importStatement.trim());
          content = lines.join('\n');
        } else {
          content = importStatement + content;
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

walkDir(path.join(__dirname, 'src', 'app'));
