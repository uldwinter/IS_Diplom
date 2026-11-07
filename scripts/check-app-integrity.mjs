import fs from 'node:fs';
import path from 'node:path';
const conflict = /^(?:<{7}|={7}|>{7})(?: |$)/m;
function walk(dir) {
  for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
    if (['node_modules','dist','.git','.vercel'].includes(item.name)) continue;
    const full=path.join(dir,item.name);
    if(item.isDirectory()) walk(full);
    else if(/\.(ts|tsx|js|mjs|json|yml|yaml|md|sql|sh)$/.test(full) && conflict.test(fs.readFileSync(full,'utf8'))) throw new Error(`Unresolved conflict: ${full}`);
  }
}
walk('.');
if(/ensureFrontendSeedData|AppProvider/.test(fs.readFileSync('src/app/App.tsx','utf8'))) throw new Error('Local demo state is mounted');
console.log('Source integrity passed');
