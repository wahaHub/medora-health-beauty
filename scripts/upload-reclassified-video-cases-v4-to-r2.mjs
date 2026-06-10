#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

const SOURCE_ROOT =
  process.env.VIDEO_CASES_V4_SOURCE_ROOT ||
  '/Users/haowang/Desktop/雷鸣视频下载/Medora项目整理_重新分类_20260610';
const PREFIX = process.env.VIDEO_CASES_R2_PREFIX || 'video_cases_v4';
const CONCURRENCY = Number(process.env.R2_UPLOAD_CONCURRENCY || 5);
const DRY_RUN = process.argv.includes('--dry-run');
const RESUME = process.argv.includes('--resume');
const INCLUDE_OUT_OF_SCOPE = process.argv.includes('--include-out-of-scope');
const INCLUDE_DENTAL = process.argv.includes('--include-dental');

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing R2 env vars: ${missing.join(', ')}`);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 10_000,
    requestTimeout: 600_000,
  }),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function publicUrlFor(key) {
  return `${process.env.R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function labelFromSlug(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((part) => (part === 'and' ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

const FRONTEND_PROJECTS = {
  buttocks: 'body-contouring',
  'core-contouring': 'body-contouring',
  'facelift-surgery': 'facial-contouring',
  hair: 'hair-transplant',
  'injectables-ns': 'injectables',
  'neck-surgery': 'facial-contouring',
  'other-facial-surgery': 'facial-contouring',
};

function isDentalCase(item) {
  return item.subcategory === 'dental' || item.project === 'dental' || item.project === '_out-of-scope/dental';
}

function dentalProjectFor(item) {
  const reason = String(item.reason || '').toLowerCase();
  if (/美白|牙黄|黄牙|whitening/.test(reason)) return 'teeth-whitening';
  if (/微笑线|微笑|设计|smile/.test(reason)) return 'smile-design';
  return 'porcelain-veneers';
}

function frontendProjectFor(item) {
  if (item.outOfScope && isDentalCase(item)) {
    return dentalProjectFor(item);
  }

  const sourceProject = item.subcategory || item.project;
  return FRONTEND_PROJECTS[sourceProject] || sourceProject;
}

async function objectExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    return true;
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (statusCode === 404 || error?.name === 'NotFound') return false;
    throw error;
  }
}

async function uploadFile(sourcePath, key, contentType, cacheControl) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fs.readFileSync(sourcePath),
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  );
}

async function uploadJson(object, key) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(JSON.stringify(object, null, 2)),
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'public, max-age=300',
    })
  );
}

async function runPool(items, worker) {
  let cursor = 0;
  const results = [];
  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

const sourceManifest = readJson(path.join(SOURCE_ROOT, 'manifest.json'));
const sourceCases = sourceManifest.cases || [];
const publishableCases = sourceCases.filter(
  (item) => INCLUDE_OUT_OF_SCOPE || !item.outOfScope || (INCLUDE_DENTAL && item.outOfScope && isDentalCase(item))
);
const includedDentalOutOfScope = publishableCases.filter((item) => item.outOfScope && isDentalCase(item)).length;

const rows = publishableCases.map((item) => {
  if (!fs.existsSync(item.outputPath)) {
    throw new Error(`Missing local video: ${item.outputPath}`);
  }

  const project = frontendProjectFor(item);
  const objectKey = `${PREFIX}/videos/${project}/${item.doctor}/${item.caseId}/video.mp4`;
  return {
    id: item.caseId || item.id,
    doctor: item.doctor,
    doctorName: item.doctorName,
    project,
    projectName: labelFromSlug(project),
    objectKey,
    videoUrl: publicUrlFor(objectKey),
    size: item.size,
    sourceSet: item.sourceSet,
    sourcePath: item.sourcePath,
    sourceKind: item.sourceKind,
    classificationSource: item.classificationSource,
    classificationConfidence: item.classificationConfidence,
  };
});

const duplicateKeys = rows
  .map((row) => row.objectKey)
  .filter((key, index, keys) => keys.indexOf(key) !== index);
if (duplicateKeys.length) {
  throw new Error(`Duplicate R2 keys detected: ${[...new Set(duplicateKeys)].slice(0, 5).join(', ')}`);
}

if (!DRY_RUN) {
  await runPool(rows, async (row, index) => {
    if (RESUME && (await objectExists(row.objectKey))) {
      if ((index + 1) % 25 === 0 || index + 1 === rows.length) {
        console.log(`checked ${index + 1}/${rows.length}`);
      }
      return row;
    }
    const localCase = publishableCases[index];
    await uploadFile(localCase.outputPath, row.objectKey, 'video/mp4', 'public, max-age=31536000, immutable');
    if ((index + 1) % 25 === 0 || index + 1 === rows.length) {
      console.log(`uploaded ${index + 1}/${rows.length}`);
    }
    return row;
  });
}

const doctors = Array.from(new Set(rows.map((row) => row.doctor))).sort();
const projects = Array.from(new Set(rows.map((row) => row.project))).sort();
const manifest = {
  generatedAt: new Date().toISOString(),
  source: `${process.env.R2_BUCKET_NAME}/${PREFIX}`,
  prefix: PREFIX,
  count: rows.length,
  doctors,
  projects,
  cases: rows,
};

const outDir = path.join(SOURCE_ROOT, PREFIX === 'video_cases_v4' ? '_r2_v4' : `_${PREFIX}`);
fs.mkdirSync(outDir, { recursive: true });
const manifestPath = path.join(outDir, 'manifest.json');
const csvPath = path.join(outDir, 'manifest.csv');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
fs.writeFileSync(
  csvPath,
  [
    'id,doctor,doctorName,project,projectName,objectKey,videoUrl,size,sourceSet,sourceKind,classificationConfidence',
    ...rows.map((row) =>
      [
        row.id,
        row.doctor,
        row.doctorName,
        row.project,
        row.projectName,
        row.objectKey,
        row.videoUrl,
        row.size,
        row.sourceSet,
        row.sourceKind,
        row.classificationConfidence,
      ]
        .map(csvEscape)
        .join(',')
    ),
  ].join('\n')
);

if (!DRY_RUN) {
  await uploadJson(manifest, `${PREFIX}/manifest.json`);
}

console.log(
  JSON.stringify(
    {
      dryRun: DRY_RUN,
      prefix: PREFIX,
      sourceRoot: SOURCE_ROOT,
      count: rows.length,
      sourceCases: sourceCases.length,
      includedDentalOutOfScope,
      excludedOutOfScope: sourceCases.length - publishableCases.length,
      projects: projects.map((project) => [project, rows.filter((row) => row.project === project).length]),
      manifest: manifestPath,
      csv: csvPath,
      remoteManifest: publicUrlFor(`${PREFIX}/manifest.json`),
    },
    null,
    2
  )
);

s3.destroy();
