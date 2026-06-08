const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('.bin') && !full.includes('react-native\\') && !full.includes('react-native-') && !full.includes('expo\\')) {
        walk(full);
      }
    } else if (full.endsWith('.js') || full.endsWith('.ts')) {
      try {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes('SafeAreaView') && c.includes('react-native') && !c.includes('react-native-safe-area-context')) {
           const match = /require\(['"]react-native['"]\)/.test(c) || /from\s+['"]react-native['"]/.test(c);
           if (match) {
             console.log(full.substring(0, 150));
           }
        }
      } catch (e) {}
    }
  }
}
walk('c:/Users/Anubhav Singh/Desktop/BS2/node_modules');