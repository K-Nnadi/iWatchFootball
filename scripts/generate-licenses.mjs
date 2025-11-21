import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Function to fetch license from npm registry
async function fetchLicenseFromNpm(packageName) {
  return new Promise((resolve) => {
    const url = `https://registry.npmjs.org/${packageName}/latest`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const pkg = JSON.parse(data);
          // Handle different license formats
          if (pkg.license) {
            resolve(pkg.license);
          } else if (pkg.licenses && Array.isArray(pkg.licenses)) {
            resolve(pkg.licenses.map(l => l.type).join(' OR '));
          } else if (pkg.licenses && typeof pkg.licenses === 'string') {
            resolve(pkg.licenses);
          } else {
            resolve('Unknown');
          }
        } catch (error) {
          resolve('Unknown');
        }
      });
    }).on('error', () => {
      resolve('Unknown');
    }).setTimeout(5000, () => {
      resolve('Unknown');
    });
  });
}

// Function to read package.json and extract dependencies
function extractDependencies(packageJsonPath, source) {
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);
    
    const deps = {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      peerDependencies: pkg.peerDependencies || {},
    };
    
    const allDeps = [];
    Object.entries(deps.dependencies).forEach(([name, version]) => {
      allDeps.push({ name, version, source, type: 'dependency' });
    });
    Object.entries(deps.devDependencies).forEach(([name, version]) => {
      allDeps.push({ name, version, source, type: 'devDependency' });
    });
    Object.entries(deps.peerDependencies || {}).forEach(([name, version]) => {
      allDeps.push({ name, version, source, type: 'peerDependency' });
    });
    
    return allDeps;
  } catch (error) {
    console.warn(`Could not read ${packageJsonPath}:`, error.message);
    return [];
  }
}

// Collect all dependencies from all package.json files
const packages = [
  { name: 'root', path: path.join(rootDir, 'package.json') },
  { name: 'frontend', path: path.join(rootDir, 'frontend', 'ui', 'package.json') },
  { name: 'backend', path: path.join(rootDir, 'backend', 'package.json') },
  { name: 'base-tools', path: path.join(rootDir, 'libraries', 'base', 'package.json') },
];

console.log('Collecting dependencies from package.json files...');
const allDependencies = new Map();

packages.forEach(({ name, path: pkgPath }) => {
  if (fs.existsSync(pkgPath)) {
    const deps = extractDependencies(pkgPath, name);
    deps.forEach((dep) => {
      // Skip workspace dependencies
      if (dep.name.startsWith('@iWatchFootball/') || dep.version.startsWith('workspace:')) {
        return;
      }
      
      // Clean version string (remove ^, ~, etc.)
      const cleanVersion = dep.version.replace(/[\^~>=<]/g, '').split(' ')[0];
      
      if (!allDependencies.has(dep.name)) {
        allDependencies.set(dep.name, {
          name: dep.name,
          version: cleanVersion,
          license: null, // Will be fetched
          sources: [name],
        });
      } else {
        const existing = allDependencies.get(dep.name);
        if (!existing.sources.includes(name)) {
          existing.sources.push(name);
        }
      }
    });
  }
});

console.log(`Found ${allDependencies.size} unique dependencies`);
console.log('Fetching license information from npm registry...');

// Fetch licenses for all dependencies
const dependenciesArray = Array.from(allDependencies.values());
let fetched = 0;

// Process in batches to avoid overwhelming npm registry
const batchSize = 10;
for (let i = 0; i < dependenciesArray.length; i += batchSize) {
  const batch = dependenciesArray.slice(i, i + batchSize);
  const promises = batch.map(async (dep) => {
    const license = await fetchLicenseFromNpm(dep.name);
    dep.license = license;
    fetched++;
    if (fetched % 10 === 0) {
      console.log(`Fetched ${fetched}/${dependenciesArray.length} licenses...`);
    }
  });
  
  await Promise.all(promises);
  
  // Small delay between batches to be respectful to npm registry
  if (i + batchSize < dependenciesArray.length) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Sort dependencies alphabetically
const sortedDeps = dependenciesArray
  .map(({ name, version, license, sources }) => ({
    name,
    version,
    license: license || 'Unknown',
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Generate licenses data
const licensesData = {
  generatedAt: new Date().toISOString(),
  dependencies: sortedDeps,
};

// Write to frontend public directory
const outputPath = path.join(rootDir, 'frontend', 'ui', 'public', 'licenses.json');

// Ensure the directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  fs.writeFileSync(outputPath, JSON.stringify(licensesData, null, 2));
  console.log(`\n✅ Generated licenses.json with ${sortedDeps.length} dependencies`);
  console.log(`📁 Output: ${outputPath}`);
  process.exit(0);
} catch (error) {
  console.error(`\n❌ Error writing licenses.json:`, error.message);
  console.error('Build will continue, but licenses.json may be outdated.');
  process.exit(0); // Don't fail the build
}

