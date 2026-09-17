import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'src');
const sourceExtensions = new Set(['.ts', '.tsx']);
const allowedFeatureDirectories = new Set([
  'actions',
  'api',
  'components',
  'functions',
  'hooks',
  'schemas',
  'sync',
  'types',
]);
const serverInfrastructurePaths = new Set([
  'src/lib/auth/environment.ts',
  'src/lib/auth/options.ts',
  'src/lib/uploadthing.ts',
]);
const errors = [];

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath);
      return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : [];
    })
  );

  return nestedFiles.flat();
}

function relativePath(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join('/');
}

function addError(filePath, message) {
  errors.push(`${relativePath(filePath)}: ${message}`);
}

function getFeatureName(filePath) {
  const match = relativePath(filePath).match(/^src\/features\/([^/]+)\//);
  return match?.[1] ?? null;
}

function inspectDependencyRules(filePath, source) {
  const relative = relativePath(filePath);
  const isTestFile = relative.endsWith('.test.ts') || relative.endsWith('.test.tsx');

  if (
    serverInfrastructurePaths.has(relative) &&
    !/^import ['"]server-only['"];/m.test(source)
  ) {
    addError(filePath, 'server infrastructure must import server-only');
  }

  if (
    (relative.startsWith('src/lib/') || relative.startsWith('src/components/')) &&
    source.includes('@/features/')
  ) {
    addError(filePath, 'shared code must not depend on a feature');
  }

  if (/^src\/features\/.*\/route\.ts$/.test(relative)) {
    addError(filePath, 'HTTP route handlers belong under src/app/api');
  }

  if (/^src\/app\/.*\/page\.tsx$/.test(relative) && /^['"]use client['"];?/m.test(source)) {
    addError(filePath, 'page.tsx must remain a server composition root');
  }

  if (
    /^src\/app\/.*\/page\.tsx$/.test(relative) &&
    source.includes('@/features/auth/api/require-user')
  ) {
    addError(filePath, 'pages must render an anonymous state instead of forcing login');
  }

  if (
    /^src\/app\/.*\/page\.tsx$/.test(relative) &&
    relative !== 'src/app/(auth)/register/page.tsx' &&
    /redirect\(\s*['"]\/login(?:[?'"])/.test(source)
  ) {
    addError(filePath, 'pages must not redirect anonymous visitors to login');
  }

  if (
    !isTestFile &&
    /^src\/features\/[^/]+\/actions\//.test(relative) &&
    !/^['"]use server['"];?/m.test(source)
  ) {
    addError(filePath, 'feature actions must declare the use server boundary');
  }

  if (
    !isTestFile &&
    /^src\/features\/[^/]+\/(api|sync)\//.test(relative) &&
    !/^import ['"]server-only['"];?/m.test(source)
  ) {
    addError(filePath, 'feature api and sync modules must import server-only');
  }

  if (
    !isTestFile &&
    /^src\/features\/[^/]+\/functions\//.test(relative) &&
    (
      /^import ['"]server-only['"];/m.test(source) ||
      /@\/features\/[^/'"]+\/(api|actions|sync)\//.test(source) ||
      /@\/lib\/(prisma|auth\/)/.test(source)
    )
  ) {
    addError(
      filePath,
      'feature functions must remain pure and must not depend on server modules'
    );
  }

  const isClientComponent = /^['"]use client['"];?/m.test(source);
  if (
    isClientComponent &&
    /@\/features\/[^/'"]+\/(api|sync)\//.test(source)
  ) {
    addError(filePath, 'client components must not import feature api or sync modules');
  }
  if (
    isClientComponent &&
    /@\/lib\/(prisma|auth\/)/.test(source)
  ) {
    addError(filePath, 'client components must not import server infrastructure');
  }

  const hasPrismaImport = source.includes('@/lib/prisma') || source.includes('@prisma/client');
  const isPrismaBoundary =
    /^src\/features\/[^/]+\/(api|actions|sync)\//.test(relative) ||
    relative === 'src/lib/prisma.ts' ||
    relative === 'src/lib/auth/options.ts';

  if (hasPrismaImport && !isPrismaBoundary) {
    addError(filePath, 'Prisma access is limited to feature api/actions/sync and lib infrastructure');
  }

  const legacyImports = [
    '@/lib/actions/',
    '@/lib/services/',
    '@/components/analytics/',
    '@/components/dashboard/',
    '@/components/problem/',
    '@/components/solutions/',
  ];

  for (const legacyImport of legacyImports) {
    if (source.includes(legacyImport)) {
      addError(filePath, `legacy import is not allowed: ${legacyImport}`);
    }
  }

  const executableBarrelPattern = /import\s+(?!type\b)[^;]*?from\s+['"]@\/features\/[^/]+\/(?:types|api|actions|functions|components|schemas)['"]/gs;
  if (executableBarrelPattern.test(source)) {
    addError(filePath, 'executable imports must point to a concrete file');
  }

  if (
    /^src\/features\//.test(relative) &&
    !/\/types\//.test(relative) &&
    !isTestFile &&
    /^export\s+(?:interface|type)\s/m.test(source)
  ) {
    addError(filePath, 'shared feature types belong under the feature types directory');
  }
}

function inspectFeatureDirectory(filePath) {
  const relative = relativePath(filePath);
  const match = relative.match(/^src\/features\/[^/]+\/([^/]+)\//);
  if (!match) return;

  if (!allowedFeatureDirectories.has(match[1])) {
    addError(filePath, `unexpected feature directory: ${match[1]}`);
  }
}

function inspectTypeBarrel(filePath, source) {
  if (!relativePath(filePath).match(/^src\/features\/[^/]+\/types\/index\.ts$/)) return;

  if (/\bexport\s+(?!type\b)/.test(source)) {
    addError(filePath, 'types/index.ts may contain type-only exports only');
  }
}

function collectFeatureDependencies(filePath, source, graph) {
  const sourceFeature = getFeatureName(filePath);
  if (!sourceFeature) return;

  const dependencies = graph.get(sourceFeature) ?? new Set();
  const featureImportPattern = /(?:from\s+|import\s*\()['"]@\/features\/([^/'"]+)/g;

  for (const match of source.matchAll(featureImportPattern)) {
    const targetFeature = match[1];
    if (targetFeature !== sourceFeature) dependencies.add(targetFeature);
  }

  graph.set(sourceFeature, dependencies);
}

function findFeatureCycles(graph) {
  const visiting = new Set();
  const visited = new Set();

  function visit(feature, route) {
    if (visiting.has(feature)) {
      const cycleStart = route.indexOf(feature);
      errors.push(`feature dependency cycle: ${[...route.slice(cycleStart), feature].join(' -> ')}`);
      return;
    }
    if (visited.has(feature)) return;

    visiting.add(feature);
    for (const dependency of graph.get(feature) ?? []) {
      visit(dependency, [...route, feature]);
    }
    visiting.delete(feature);
    visited.add(feature);
  }

  for (const feature of graph.keys()) visit(feature, []);
}

const files = await collectSourceFiles(sourceRoot);
const featureGraph = new Map();

for (const filePath of files) {
  const source = await readFile(filePath, 'utf8');
  inspectDependencyRules(filePath, source);
  inspectFeatureDirectory(filePath);
  inspectTypeBarrel(filePath, source);
  collectFeatureDependencies(filePath, source, featureGraph);
}

findFeatureCycles(featureGraph);

const manualSyncPath = path.join(projectRoot, 'prisma', 'sync-latest.ts');
const manualSyncSource = await readFile(manualSyncPath, 'utf8');
if (/prisma\.\w+\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/.test(manualSyncSource)) {
  addError(
    manualSyncPath,
    'manual sync entrypoints may read and compose, but persistence belongs in feature sync modules'
  );
}

if (errors.length > 0) {
  console.error(['Architecture check failed:', ...errors.map((error) => `- ${error}`)].join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Architecture check passed (${files.length} source files).`);
}
