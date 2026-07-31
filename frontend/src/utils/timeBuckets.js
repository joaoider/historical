export function periodSizeForYear(year) {
    return year >= 1800 ? 50 : 100;
}

export function periodStartForYear(year) {
    const size = periodSizeForYear(year);
    return Math.floor(year / size) * size;
}

export function periodEndForStart(start) {
    return start + periodSizeForYear(start) - 1;
}

export function formatAdaptivePeriod(start) {
    const end = periodEndForStart(start);
    if (end < 0) return `${Math.abs(start)}–${Math.abs(end)} a.C.`;
    return `${start === 0 ? 1 : start}–${end} d.C.`;
}
