/**
 * Node CLI: validate fixture, production Band A, and literacy Wave 1 bundles.
 * Not imported by the React app.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateCurriculum,
  validateLiteracyWordsAgainstBandA,
  validateSkillsAgainstCatalog,
  type ValidationIssue,
} from "../src/content/curriculum/validation/validateCurriculum.ts";
import { formatSchemaIssue, validateJsonSchema } from "./validateJsonSchema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaRel = "src/content/curriculum/schema/curriculum-bundle.schema.json";
const schemaPath = join(root, schemaRel);

const BUNDLES = [
  {
    label: "fixture",
    rel: "src/content/curriculum/data/fixture/curriculum.json",
  },
  {
    label: "production-band-a",
    rel: "src/content/curriculum/data/production/band-a.json",
  },
  {
    label: "production-literacy-wave-1",
    rel: "src/content/curriculum/data/production/literacy-path.wave-1.json",
  },
] as const;

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function printMeta(label: string, rel: string, bundle: unknown) {
  const meta =
    bundle &&
    typeof bundle === "object" &&
    "meta" in bundle &&
    bundle.meta &&
    typeof bundle.meta === "object"
      ? (bundle.meta as {
          kind?: string;
          id?: string;
          notProductionCurriculum?: boolean;
          title?: string;
        })
      : {};

  console.log(`Bundle: ${label}`);
  console.log(`File: ${rel}`);
  console.log("Kind:", meta.kind ?? "(missing)");
  console.log("Id:", meta.id ?? "(missing)");
  console.log(
    "Not production curriculum:",
    meta.notProductionCurriculum === true ? "yes" : meta.notProductionCurriculum === false ? "no" : "(missing)",
  );
  if (meta.title) console.log("Title:", meta.title);
}

function validateOne(
  label: string,
  rel: string,
  schema: unknown,
): { ok: boolean; schemaOk: boolean; refOk: boolean; schemaErrors: number; refErrors: number } {
  const path = join(root, rel);
  let bundle: unknown;
  try {
    bundle = loadJson(path);
  } catch (error) {
    console.error(`Failed to parse ${label} JSON: ${path}`);
    console.error(error instanceof Error ? error.message : error);
    return { ok: false, schemaOk: false, refOk: false, schemaErrors: 1, refErrors: 0 };
  }

  printMeta(label, rel, bundle);

  const schemaIssues = validateJsonSchema(bundle, schema);
  const schemaOk = schemaIssues.length === 0;
  if (!schemaOk) {
    console.log("");
    for (const issue of schemaIssues) {
      console.log(formatSchemaIssue(issue));
    }
    console.log("");
    console.log(`${label}: FAIL`);
    console.log(`Schema: FAIL (${schemaIssues.length} error(s))`);
    console.log("References: SKIPPED");
    return {
      ok: false,
      schemaOk: false,
      refOk: false,
      schemaErrors: schemaIssues.length,
      refErrors: 0,
    };
  }

  const refs = validateCurriculum(bundle);
  const extraIssues: ValidationIssue[] = [];
  const catalogRel = "src/content/curriculum/data/production/shared-skills.json";
  try {
    const catalog = loadJson(join(root, catalogRel));
    validateSkillsAgainstCatalog(bundle, catalog, (issue) => {
      extraIssues.push({
        code: issue.code,
        path: issue.path,
        message: issue.message,
        severity: issue.severity ?? "error",
      });
    });
  } catch (error) {
    extraIssues.push({
      code: "SKILL_CATALOG",
      path: catalogRel,
      message: `Could not load shared skill catalog: ${
        error instanceof Error ? error.message : String(error)
      }`,
      severity: "error",
    });
  }
  if (label === "production-literacy-wave-1") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateLiteracyWordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE1_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 1 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  const issues = [...refs.issues, ...extraIssues];
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const refOk = errorCount === 0;

  if (issues.length > 0) {
    console.log("");
    for (const issue of issues) {
      const tag = issue.severity === "error" ? "ERROR" : "WARN ";
      console.log(`${tag}  ${issue.code}  ${issue.path}`);
      console.log(`      ${issue.message}`);
    }
  }

  console.log("");
  if (refOk) {
    console.log(`${label}: PASS`);
    console.log("Schema: PASS");
    console.log("References: PASS");
    console.log(`${issues.length} issues`);
  } else {
    console.log(`${label}: FAIL`);
    console.log("Schema: PASS");
    console.log(`References: FAIL (${errorCount} error(s), ${warningCount} warning(s))`);
  }

  return {
    ok: refOk,
    schemaOk: true,
    refOk,
    schemaErrors: 0,
    refErrors: errorCount,
  };
}

function main() {
  let schema: unknown;
  try {
    schema = loadJson(schemaPath);
  } catch (error) {
    console.error(`Failed to parse JSON Schema: ${schemaPath}`);
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  console.log("Schema:", schemaRel);
  console.log("");

  const results = BUNDLES.map((bundle, index) => {
    if (index > 0) console.log("\n---\n");
    return { label: bundle.label, ...validateOne(bundle.label, bundle.rel, schema) };
  });

  const failed = results.filter((r) => !r.ok);
  console.log("\n===");
  for (const r of results) {
    console.log(`${r.label}: ${r.ok ? "PASS" : "FAIL"}`);
  }

  if (failed.length > 0) {
    console.log("");
    console.log("Curriculum validation FAIL");
    console.log(`Failed bundle(s): ${failed.map((f) => f.label).join(", ")}`);
    process.exit(1);
  }

  console.log("");
  console.log("Curriculum validation PASS");
  console.log(`Bundles: ${results.length} (fixture + production Band A + literacy Wave 1)`);
  console.log("Shared skills: src/content/curriculum/data/production/shared-skills.json");
  process.exit(0);
}

main();
