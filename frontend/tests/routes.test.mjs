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

test("categorias de indicações preservam a área e a categoria", () => {
    const path = "/conhecimento/area/filosofia/metafisica/indicacoes/livros";
    assert.equal(pathForView("knowledge-recommendations", { areaPath: "filosofia/metafisica", category: "livros" }), path);
    assert.deepEqual(routeFromPath(path), { view: "knowledge-recommendations", entityId: null, areaPath: "filosofia/metafisica", recommendationCategory: "livros" });
});

test("itens da biblioteca preservam categoria, área e título", () => {
    const item = { category: "books", areaPath: "filosofia/metafisica", title: "Metafísica: uma introdução" };
    const path = pathForView("library-item", item);
    assert.equal(path, "/meu-ider/acervo/books/filosofia%2Fmetafisica%3AMetaf%C3%ADsica%3A%20uma%20introdu%C3%A7%C3%A3o");
    assert.deepEqual(routeFromPath(path), { view: "library-item", entityId: null, libraryItem: item });
});

test("raiz, barra final e rota desconhecida têm fallback previsível", () => {
    assert.deepEqual(routeFromPath("/"), { view: "home", entityId: null });
    assert.deepEqual(routeFromPath("/sobre/"), { view: "about", entityId: null });
    assert.deepEqual(routeFromPath("/nao-existe"), { view: "home", entityId: null });
});
