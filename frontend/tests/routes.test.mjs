import assert from "node:assert/strict";
import test from "node:test";

import { pathForView, routeFromPath, VIEW_PATHS } from "../src/utils/routes.js";

test("cada visão pública possui uma URL estável", () => {
    for (const [view, path] of Object.entries(VIEW_PATHS)) {
        assert.deepEqual(routeFromPath(path), { view, entityId: null });
        assert.equal(pathForView(view), path);
    }
});

test("perfis individuais preservam o identificador na URL", () => {
    assert.equal(pathForView("profiles", 42), "/perfis/42");
    assert.deepEqual(routeFromPath("/perfis/42"), { view: "profiles", entityId: 42 });
});

test("áreas do conhecimento preservam todo o caminho hierárquico", () => {
    const path = "/conhecimento/area/ciencias-formais/matematica/fundamentos";
    assert.equal(pathForView("knowledge-area", "ciencias-formais/matematica/fundamentos"), path);
    assert.deepEqual(routeFromPath(path), { view: "knowledge-area", entityId: null, areaPath: "ciencias-formais/matematica/fundamentos" });
});

test("raiz, barra final e rota desconhecida têm fallback previsível", () => {
    assert.deepEqual(routeFromPath("/"), { view: "home", entityId: null });
    assert.deepEqual(routeFromPath("/sobre/"), { view: "about", entityId: null });
    assert.deepEqual(routeFromPath("/nao-existe"), { view: "home", entityId: null });
});
