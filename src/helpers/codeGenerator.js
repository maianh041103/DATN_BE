export function generateCode(code, no) {
    if (no <= 0) return `${code}000000000`;
    if (no < 10) return `${code}00000000${no}`;
    if (no < 100) return `${code}0000000${no}`;
    if (no < 1000) return `${code}000000${no}`;
    if (no < 10000) return `${code}00000${no}`;
    if (no < 100000) return `${code}0000${no}`;
    if (no < 1000000) return `${code}000${no}`;
    if (no < 10000000) return `${code}00${no}`;
    if (no < 100000000) return `${code}0${no}`;
    if (no < 1000000000) return `${code}${no}`;
    return no;
}