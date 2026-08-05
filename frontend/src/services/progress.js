import api from "./api";

const USER_ID = "mvp-user";

function readLocal(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
}

function hasData(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value && typeof value === "object" && Object.keys(value).length > 0;
}

export async function loadProgress(scope, localKey, fallback) {
    const local = readLocal(localKey, fallback);
    try {
        const response = await api.get(`/progress/${scope}`, { params: { user_id: USER_ID } });
        const remote = response.data.data;
        if (hasData(remote)) {
            window.localStorage.setItem(localKey, JSON.stringify(remote));
            return remote;
        }
        if (hasData(local)) await saveProgress(scope, localKey, local);
        return local;
    } catch {
        return local;
    }
}

export async function saveProgress(scope, localKey, data) {
    window.localStorage.setItem(localKey, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("ider-progress-updated", { detail: { scope, data } }));
    try {
        await api.put(`/progress/${scope}`, { user_id: USER_ID, data });
        return true;
    } catch {
        return false;
    }
}

export { readLocal };
