const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.expo') && !full.includes('.next') && !full.includes('dist')) {
        walk(full);
      }
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf8');
      const regex = /import\s+{([^}]*?)}\s+from\s+['"]react-native['"]/g;
      let match;
      while ((match = regex.exec(c)) !== null) {
        if (match[1].includes('SafeAreaView')) {
          console.log(full);
        }
      }
    }
  }
}
walk('c:/Users/Anubhav Singh/Desktop/BS2');