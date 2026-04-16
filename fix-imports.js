const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'src', 'app', 'api');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Calculate depth from cosmetic-shop root to current directory
      // __dirname is cosmetic-shop
      const relativeToRoot = path.relative(path.dirname(fullPath), __dirname);
      const correctImportPath = relativeToRoot.replace(/\\/g, '/') + '/server/db';
      
      const newContent = content.replace(/(from ['"]).*?server\/db(['"])/g, `$1${correctImportPath}$2`);
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

fixImports(srcAppDir);
