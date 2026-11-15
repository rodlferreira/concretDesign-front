import { readFile } from "node:fs/promises";
const root = new URL("../src/i18n/", import.meta.url);
const load = async (file) =>
  JSON.parse(await readFile(new URL(file, root), "utf8"));
const base = await load("pt-PT.json");
const languages = await load("languages.json");
const errors = [];
for (const { code } of languages) {
  try {
    const catalog = await load(`${code}.json`);
    for (const key of Object.keys(base)) {
      if (typeof catalog[key] !== "string" || !catalog[key].trim())
        errors.push(`${code}: missing ${key}`);
    }
    for (const key of Object.keys(catalog)) {
      if (!(key in base)) errors.push(`${code}: unknown ${key}`);
    }
  } catch (error) {
    errors.push(`${code}: ${error.message}`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `${languages.length} complete catalogs; ${Object.keys(base).length} strings per language.`,
  );
