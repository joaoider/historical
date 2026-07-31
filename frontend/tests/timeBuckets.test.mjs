import assert from "node:assert/strict";
import test from "node:test";

import { formatAdaptivePeriod, periodEndForStart, periodSizeForYear, periodStartForYear } from "../src/utils/timeBuckets.js";

test("agrupa datas anteriores a 1800 em intervalos de 100 anos", () => {
    assert.equal(periodSizeForYear(1799), 100);
    assert.equal(periodStartForYear(1754), 1700);
    assert.equal(periodEndForStart(1700), 1799);
    assert.equal(formatAdaptivePeriod(1700), "1700–1799 d.C.");
});

test("agrupa datas a partir de 1800 em intervalos de 50 anos", () => {
    assert.equal(periodSizeForYear(1800), 50);
    assert.equal(periodStartForYear(1848), 1800);
    assert.equal(periodStartForYear(1850), 1850);
    assert.equal(periodStartForYear(2026), 2000);
    assert.equal(formatAdaptivePeriod(1850), "1850–1899 d.C.");
});

test("mantém períodos antigos em intervalos centenários", () => {
    assert.equal(periodStartForYear(-431), -500);
    assert.equal(formatAdaptivePeriod(-500), "500–401 a.C.");
});
