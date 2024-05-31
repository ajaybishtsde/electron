
// import { throttle } from 'yggdrasil/lib/lang';
// import { on } from 'yggdrasil/lib/event';

// const debug: Debug.Logger = require('debug')(`ryver-desktop:renderer:extensions:force-gc`);

// const gc = require('@paulcbetts/gc');

// export interface ForceGCOptions {
//     timer?: number;
// }

// export function forceGC({ timer = 10 * 1000 }: ForceGCOptions = {}) {
//     return (window: Window) => {
//         debug('force-gc ENABLED');
//         on(window, 'blur', throttle(() => {
//             debug('forcing GC');
//             gc();
//         }, timer));
//     };
// }

// export default forceGC;
