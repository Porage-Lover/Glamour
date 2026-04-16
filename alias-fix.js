const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'src');

function aliasImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      aliasImports(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace any arbitrary relative path pointing to server/db with @server/db
      const newContent = content.replace(/(from ['"])(?:\.\.\/)*server\/db(['"])/g, `$1@server/db$2`);
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Aliased: ${fullPath}`);
      }
    }
  }
}

aliasImports(srcAppDir);
