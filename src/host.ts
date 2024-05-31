import { parse } from 'url';

export function toUri(host: string) {
    let parsed = parse(host);
    if (parsed.host === null) {
        parsed = parse(`https://${host}.ryver.com`);
    }
    return parsed.href;
}
