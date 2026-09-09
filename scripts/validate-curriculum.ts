/**
 * Node CLI: validate fixture, production Band A, literacy Waves 1–22, Module 1, and Module 2.
 * Not imported by the React app.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateCurriculum,
  validateLiteracyWordsAgainstBandA,
  validateWave2WordsAgainstBandA,
  validateWave3WordsAgainstBandA,
  validateWave4WordsAgainstBandA,
  validateWave5WordsAgainstBandA,
  validateWave6WordsAgainstBandA,
  validateWave7WordsAgainstBandA,
  validateWave8WordsAgainstBandA,
  validateWave9WordsAgainstBandA,
  validateWave10WordsAgainstBandA,
  validateWave11WordsAgainstBandA,
  validateWave12WordsAgainstBandA,
  validateWave13WordsAgainstBandA,
  validateWave14WordsAgainstBandA,
  validateWave15WordsAgainstBandA,
  validateWave16WordsAgainstBandA,
  validateWave17WordsAgainstBandA,
  validateWave20WordsAgainstBandA,
  validateWave21WordsAgainstBandA,
  validateWave22WordsAgainstBandA,
  validateReadingFoundationsWordsAgainstBandA,
  validateOrthographicFoundationsWordsAgainstBandA,
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
  {
    label: "production-literacy-wave-2",
    rel: "src/content/curriculum/data/production/literacy-path.wave-2.json",
  },
  {
    label: "production-literacy-wave-3",
    rel: "src/content/curriculum/data/production/literacy-path.wave-3.json",
  },
  {
    label: "production-literacy-wave-4",
    rel: "src/content/curriculum/data/production/literacy-path.wave-4.json",
  },
  {
    label: "production-literacy-wave-5",
    rel: "src/content/curriculum/data/production/literacy-path.wave-5.json",
  },
  {
    label: "production-literacy-wave-6",
    rel: "src/content/curriculum/data/production/literacy-path.wave-6.json",
  },
  {
    label: "production-literacy-wave-7",
    rel: "src/content/curriculum/data/production/literacy-path.wave-7.json",
  },
  {
    label: "production-literacy-wave-8",
    rel: "src/content/curriculum/data/production/literacy-path.wave-8.json",
  },
  {
    label: "production-literacy-wave-9",
    rel: "src/content/curriculum/data/production/literacy-path.wave-9.json",
  },
  {
    label: "production-literacy-wave-10",
    rel: "src/content/curriculum/data/production/literacy-path.wave-10.json",
  },
  {
    label: "production-literacy-wave-11",
    rel: "src/content/curriculum/data/production/literacy-path.wave-11.json",
  },
  {
    label: "production-literacy-wave-12",
    rel: "src/content/curriculum/data/production/literacy-path.wave-12.json",
  },
  {
    label: "production-literacy-wave-13",
    rel: "src/content/curriculum/data/production/literacy-path.wave-13.json",
  },
  {
    label: "production-literacy-wave-14",
    rel: "src/content/curriculum/data/production/literacy-path.wave-14.json",
  },
  {
    label: "production-literacy-wave-15",
    rel: "src/content/curriculum/data/production/literacy-path.wave-15.json",
  },
  {
    label: "production-literacy-wave-16",
    rel: "src/content/curriculum/data/production/literacy-path.wave-16.json",
  },
  {
    label: "production-literacy-wave-17",
    rel: "src/content/curriculum/data/production/literacy-path.wave-17.json",
  },
  {
    label: "production-literacy-wave-18",
    rel: "src/content/curriculum/data/production/literacy-path.wave-18.json",
  },
  {
    label: "production-literacy-wave-19",
    rel: "src/content/curriculum/data/production/literacy-path.wave-19.json",
  },
  {
    label: "production-literacy-wave-20",
    rel: "src/content/curriculum/data/production/literacy-path.wave-20.json",
  },
  {
    label: "production-literacy-wave-21",
    rel: "src/content/curriculum/data/production/literacy-path.wave-21.json",
  },
  {
    label: "production-literacy-wave-22",
    rel: "src/content/curriculum/data/production/literacy-path.wave-22.json",
  },
  {
    label: "production-literacy-reading-foundations",
    rel: "src/content/curriculum/data/production/literacy-path.reading-foundations.json",
  },
  {
    label: "production-literacy-orthographic-foundations",
    rel: "src/content/curriculum/data/production/literacy-path.orthographic-foundations.json",
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
  if (label === "production-literacy-wave-2") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave2WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE2_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 2 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-4") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave4WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE4_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 4 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-6") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave6WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE6_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 6 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-5") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave5WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE5_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 5 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-10") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave10WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE10_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 10 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-11") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave11WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE11_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 11 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-12") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave12WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE12_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 12 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-13") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave13WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE13_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 13 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-14") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave14WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE14_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 14 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-15") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave15WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE15_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 15 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-16") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave16WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE16_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 16 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-17") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave17WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE17_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 17 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-20") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave20WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE20_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 20 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-21") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave21WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE21_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 21 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-22") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave22WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE22_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 22 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-reading-foundations") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateReadingFoundationsWordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "MODULE1_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Module 1 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-orthographic-foundations") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateOrthographicFoundationsWordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "MODULE2_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Module 2 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-9") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave9WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE9_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 9 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-8") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave8WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE8_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 8 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-7") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave7WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE7_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 7 word identity check: ${
          error instanceof Error ? error.message : String(error)
        }`,
        severity: "error",
      });
    }
  }

  if (label === "production-literacy-wave-3") {
    const bandARel = "src/content/curriculum/data/production/band-a.json";
    try {
      const bandA = loadJson(join(root, bandARel));
      validateWave3WordsAgainstBandA(bundle, bandA, (issue) => {
        extraIssues.push({
          code: issue.code,
          path: issue.path,
          message: issue.message,
          severity: issue.severity ?? "error",
        });
      });
    } catch (error) {
      extraIssues.push({
        code: "WAVE3_BAND_A_REF",
        path: bandARel,
        message: `Could not load Band A for Wave 3 word identity check: ${
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
  console.log(`Bundles: ${results.length} (fixture + production Band A + literacy Waves 1–22 + reading foundations + orthographic foundations)`);
  console.log("Shared skills: src/content/curriculum/data/production/shared-skills.json");
  process.exit(0);
}

main();
