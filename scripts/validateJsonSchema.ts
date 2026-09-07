/**
 * JSON Schema (Draft 2020-12) validation for curriculum bundles.
 * CLI-only — keep Ajv out of the React app bundle.
 */
import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";

export interface SchemaIssue {
  path: string;
  keyword: string;
  message: string;
}

function isSchemaObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatParams(params: ErrorObject["params"]): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      parts.push(`${key}: ${value}`);
    }
  }
  return parts.length > 0 ? ` (${parts.join(", ")})` : "";
}

export function formatSchemaIssue(issue: SchemaIssue): string {
  return `ERROR  SCHEMA  ${issue.path}  ${issue.keyword}\n      ${issue.message}`;
}

export function validateJsonSchema(data: unknown, schema: unknown): SchemaIssue[] {
  if (!isSchemaObject(schema)) {
    return [
      {
        path: "/",
        keyword: "schema",
        message: "JSON Schema file must contain an object.",
      },
    ];
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    validateSchema: true,
  });

  try {
    const validate = ajv.compile(schema);
    const ok = validate(data);
    if (ok || !validate.errors) return [];

    return validate.errors.map((err) => {
      const path = err.instancePath === "" ? "/" : err.instancePath;
      const message = `${err.message ?? "failed schema rule"}${formatParams(err.params)}`;
      return {
        path,
        keyword: err.keyword,
        message,
      };
    });
  } catch (error) {
    return [
      {
        path: "/",
        keyword: "schema",
        message: error instanceof Error ? error.message : "Failed to compile JSON Schema.",
      },
    ];
  }
}
