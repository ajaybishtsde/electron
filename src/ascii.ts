export const center = (text: string, size: number) => {
    const w0 = size / 2 << 0;
    const w1 = size / 2 + 0.5 << 0;
    return ' '.repeat(w0 - text.length / 2 << 0) + text + ' '.repeat(w1 - (text.length / 2) + 0.5 << 0);
}
