import assert from "node:assert/strict";
import test from "node:test";

import { EDITORIAL_FIELDS, getCompleteness } from "../src/utils/editorial.js";

test("registro sem metadados essenciais é classificado como incompleto", () => {
    const result = getCompleteness({ name: "Exemplo" });
    assert.equal(result.score, 0);
    assert.equal(result.level, "incomplete");
    assert.deepEqual(result.missing, EDITORIAL_FIELDS);
});

test("registro integralmente documentado alcança 100%", () => {
    const entity = Object.fromEntries(EDITORIAL_FIELDS.map((field) => [field, field === "start_year" ? 0 : "conteúdo"]));
    const result = getCompleteness(entity);
    assert.equal(result.score, 100);
    assert.equal(result.level, "complete");
    assert.deepEqual(result.missing, []);
});

test("ano zero é considerado dado editorial válido", () => {
    const result = getCompleteness({ start_year: 0 });
    assert.equal(result.missing.includes("start_year"), false);
});
