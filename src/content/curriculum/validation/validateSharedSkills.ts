/**
 * Canonical shared-skill identity. Same skill id must mean the same thing
 * in every bundle that includes it.
 */
import type { ValidationIssue } from "./validateCurriculum.ts";

export const SHARED_SKILLS_CATALOG_ID = "hurufi.production.shared-skills.v1";

const IDENTITY_FIELDS = ["id", "domain", "nameAr", "nameEn"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function sortedJoin(ids: string[]): string {
  return [...ids].sort().join(",");
}

/** Semantic fingerprint: meaning, not display hints. */
export function skillIdentityKey(row: Record<string, unknown>): string {
  return JSON.stringify({
    id: row["id"] ?? "",
    domain: row["domain"] ?? "",
    nameAr: row["nameAr"] ?? "",
    nameEn: row["nameEn"] ?? "",
    prereqSkillIds: sortedJoin(asStringArray(row["prereqSkillIds"])),
    modality: sortedJoin(asStringArray(row["modality"])),
  });
}

export function catalogSkillsFrom(data: unknown): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  if (!isRecord(data)) return map;
  const skills = Array.isArray(data["skills"]) ? data["skills"] : [];
  for (const row of skills) {
    if (isRecord(row) && typeof row["id"] === "string") map.set(row["id"], row);
  }
  return map;
}

export function validateSkillsAgainstCatalog(
  bundle: unknown,
  catalog: unknown,
  emit: (issue: Omit<ValidationIssue, "severity"> & { severity?: "error" | "warning" }) => void,
): void {
  if (!isRecord(bundle)) return;
  const catalogMap = catalogSkillsFrom(catalog);
  if (catalogMap.size === 0) {
    emit({
      code: "SKILL_CATALOG",
      path: "skills",
      message: "Shared skill catalog is empty or unreadable.",
      severity: "error",
    });
    return;
  }

  const skills = Array.isArray(bundle["skills"]) ? bundle["skills"] : [];
  skills.forEach((row, i) => {
    if (!isRecord(row) || typeof row["id"] !== "string") return;
    const canonical = catalogMap.get(row["id"]);
    if (!canonical) return;
    if (skillIdentityKey(row) !== skillIdentityKey(canonical)) {
      const diffs: string[] = [];
      for (const field of IDENTITY_FIELDS) {
        if (row[field] !== canonical[field]) diffs.push(field);
      }
      if (sortedJoin(asStringArray(row["prereqSkillIds"])) !==
        sortedJoin(asStringArray(canonical["prereqSkillIds"]))) {
        diffs.push("prereqSkillIds");
      }
      if (sortedJoin(asStringArray(row["modality"])) !==
        sortedJoin(asStringArray(canonical["modality"]))) {
        diffs.push("modality");
      }
      emit({
        code: "SKILL_IDENTITY",
        path: `skills[${i}]`,
        message: `Shared skill "${row["id"]}" does not match the canonical catalog (${diffs.join(", ") || "definition"}).`,
        severity: "error",
      });
    }
  });
}
