import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const migrationPath = resolve(root, "supabase/migrations/202603141200_init.sql");
const typesPath = resolve(root, "types/database.ts");

const migration = readFileSync(migrationPath, "utf8");
const typeSource = readFileSync(typesPath, "utf8");

function parseMigrationTables(sql) {
  const tableMatches = [...sql.matchAll(/create table if not exists public\.([a-z_]+)\s*\(([\s\S]*?)\n\);/g)];
  return Object.fromEntries(
    tableMatches.map(([, tableName, body]) => {
      const columns = body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !/^(primary key|unique|\)|constraint)/i.test(line))
        .map((line) => line.replace(/,$/, ""))
        .map((line) => line.split(/\s+/)[0])
        .filter((name) => name && !["unique", "primary", "constraint"].includes(name));

      return [tableName, new Set(columns)];
    })
  );
}

function parseTypeTables(source) {
  const tableBlockMatch = source.match(/Tables:\s*\{([\s\S]*?)\};\s*Views:/);
  if (!tableBlockMatch) {
    throw new Error("Unable to parse Database table definitions.");
  }

  const tableBlock = tableBlockMatch[1];
  const tableNameMatches = [...tableBlock.matchAll(/^\s+([a-z_]+):\s*CrudTable</gm)];
  const tableNames = tableNameMatches.map((match) => match[1]);

  const tables = {};

  for (const tableName of tableNames) {
    const tableStart = tableBlock.indexOf(`${tableName}: CrudTable<`);
    const rowStart = tableBlock.indexOf("{", tableStart);
    let depth = 0;
    let rowEnd = rowStart;

    for (let index = rowStart; index < tableBlock.length; index += 1) {
      const char = tableBlock[index];
      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          rowEnd = index;
          break;
        }
      }
    }

    const rowBody = tableBlock.slice(rowStart + 1, rowEnd);
    const directColumns = [...rowBody.matchAll(/([a-z0-9_]+):/g)].map((match) => match[1]);
    const columns = new Set(directColumns);

    if (tableBlock.slice(tableStart, rowStart).includes("Timestamps")) {
      columns.add("created_at");
      columns.add("updated_at");
    }

    tables[tableName] = columns;
  }

  return tables;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const migrationTables = parseMigrationTables(migration);
const typeTables = parseTypeTables(typeSource);

const migrationTableNames = Object.keys(migrationTables).sort();
const typeTableNames = Object.keys(typeTables).sort();

assert(
  JSON.stringify(migrationTableNames) === JSON.stringify(typeTableNames),
  `Table mismatch.\nMigration: ${migrationTableNames.join(", ")}\nTypes: ${typeTableNames.join(", ")}`
);

for (const tableName of migrationTableNames) {
  const migrationColumns = migrationTables[tableName];
  const typeColumns = typeTables[tableName];

  assert(typeColumns, `Missing type definition for table ${tableName}.`);

  const missingInMigration = [...typeColumns].filter((column) => !migrationColumns.has(column));
  const missingInTypes = [...migrationColumns].filter((column) => !typeColumns.has(column));

  assert(
    missingInMigration.length === 0,
    `Table ${tableName} is missing migration columns: ${missingInMigration.join(", ")}`
  );
  assert(
    missingInTypes.length === 0,
    `Table ${tableName} is missing type columns: ${missingInTypes.join(", ")}`
  );
}

const updatedAtTriggerTables = [
  "organizations",
  "users",
  "organization_memberships",
  "terminals",
  "carriers",
  "routes",
  "vendors",
  "shipments",
  "containers",
  "cargo",
  "payment_methods",
  "bank_accounts",
  "invoices",
  "payments",
  "transactions",
  "documents",
  "exchange_rates",
  "compliance_records",
  "credit_profiles",
  "disputes",
  "fees",
  "contracts"
];

for (const tableName of updatedAtTriggerTables) {
  assert(
    migration.includes(`drop trigger if exists ${tableName}_set_updated_at on public.${tableName};`) &&
      migration.includes(`create trigger ${tableName}_set_updated_at before update on public.${tableName}`),
    `Missing updated_at trigger bootstrap for ${tableName}.`
  );
  assert(
    migrationTables[tableName].has("updated_at"),
    `Trigger configured for ${tableName} but updated_at column is missing.`
  );
}

assert(
  migration.includes("drop trigger if exists trigger_release_cargo_on_paid_payment on public.payments;"),
  "Paid-payment cargo release trigger is not idempotent."
);
assert(
  migration.includes('insert into storage.buckets (id, name, public)'),
  "Documents storage bucket bootstrap is missing."
);
assert(
  migration.includes('drop policy if exists "authenticated document uploads" on storage.objects;') &&
    migration.includes('drop policy if exists "authenticated document reads" on storage.objects;'),
  "Storage policies are not idempotent."
);

console.log("Schema verification passed.");
