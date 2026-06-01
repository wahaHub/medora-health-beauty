import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const outFile = resolve(process.argv[2] || 'migrations/000_supabase_public_schema_openapi_snapshot.sql');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required.');
  process.exit(1);
}

const apiUrl = `${process.env.SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/`;
const response = await fetch(apiUrl, {
  headers: {
    apikey: process.env.SUPABASE_SERVICE_KEY,
    authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  },
});

if (!response.ok) {
  console.error(`Failed to fetch Supabase OpenAPI schema: ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const spec = await response.json();
const definitions = spec.definitions || {};

function quoteIdent(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

function sqlType(property) {
  const format = property.format;
  if (format === 'character varying') {
    return property.maxLength ? `varchar(${property.maxLength})` : 'varchar';
  }
  if (format === 'timestamp with time zone') return 'timestamptz';
  if (format === 'timestamp without time zone') return 'timestamp';
  if (format === 'double precision') return 'double precision';
  if (format === 'bigint') return 'bigint';
  if (format === 'integer') return 'integer';
  if (format === 'uuid') return 'uuid';
  if (format === 'date') return 'date';
  if (format === 'numeric') return 'numeric';
  if (format === 'jsonb') return 'jsonb';
  if (format === 'text') return 'text';

  if (property.type === 'boolean') return 'boolean';
  if (property.type === 'integer') return 'integer';
  if (property.type === 'number') return 'numeric';
  if (property.type === 'array' || property.type === 'object') return 'jsonb';
  return 'text';
}

function defaultSql(property) {
  if (typeof property.default === 'undefined') return '';
  const value = String(property.default);
  if (value === 'NULL') return '';
  if (/^(now|gen_random_uuid)\(\)$/.test(value)) return ` DEFAULT ${value}`;
  if (/^-?\d+(\.\d+)?$/.test(value)) return ` DEFAULT ${value}`;
  if (value === 'true' || value === 'false') return ` DEFAULT ${value}`;
  return ` DEFAULT '${value.replaceAll("'", "''")}'`;
}

function fkClause(table, column, property) {
  const description = property.description || '';
  const match = description.match(/<fk table='([^']+)' column='([^']+)'\/>/);
  if (!match) return null;
  return `  CONSTRAINT ${quoteIdent(`${table}_${column}_fkey`)} FOREIGN KEY (${quoteIdent(column)}) REFERENCES public.${quoteIdent(match[1])}(${quoteIdent(match[2])})`;
}

const lines = [
  '-- =====================================================',
  '-- Supabase public schema snapshot from PostgREST OpenAPI',
  '-- Generated from the current project configured in .env',
  `-- Generated at: ${new Date().toISOString()}`,
  '--',
  '-- Limitations:',
  '-- - This is not a pg_dump output.',
  '-- - It includes REST-exposed public tables, columns, defaults, primary keys, and visible foreign keys.',
  '-- - It does not include RLS policies, indexes, triggers, functions, grants, or non-exposed schemas.',
  '-- - For an authoritative baseline, run npm run db:snapshot with SUPABASE_DB_URL.',
  '-- =====================================================',
  '',
];

for (const [table, definition] of Object.entries(definitions)) {
  const required = new Set(definition.required || []);
  const properties = definition.properties || {};
  const columnLines = [];
  const constraints = [];

  for (const [column, property] of Object.entries(properties)) {
    const isPrimaryKey = (property.description || '').includes('<pk/>');
    const line = [
      `  ${quoteIdent(column)}`,
      sqlType(property),
      defaultSql(property).trim(),
      required.has(column) ? 'NOT NULL' : '',
      isPrimaryKey ? 'PRIMARY KEY' : '',
    ].filter(Boolean).join(' ');
    columnLines.push(line);

    const fk = fkClause(table, column, property);
    if (fk) constraints.push(fk);
  }

  lines.push(`CREATE TABLE IF NOT EXISTS public.${quoteIdent(table)} (`);
  lines.push([...columnLines, ...constraints].join(',\n'));
  lines.push(');');
  lines.push('');
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${lines.join('\n')}\n`);
console.log(`OpenAPI schema snapshot written to ${outFile}`);
