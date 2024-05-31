import { Removable } from 'yggdrasil/lib/removable';
import { Disposable } from '@modules/browser/interfaces';

export const compositeDisposable = (...disposables: Array<Disposable>): Disposable => {
    let bound = [...disposables];
    const dispose = () => {
        if (bound) {
            bound.forEach(r => {
                const fn = r ? r.dispose : void 0;
                if (fn) {
                    fn();
                }
            });
            bound = void 0;
        }
    };
    return {
        dispose
    };
};

export const dispose = (...deps: Array<Removable | Disposable>) => {
    deps.forEach((dep: any) => {
        if (!dep) return;
        if (typeof dep.dispose === 'function') {
            dep.dispose();
        } else if (typeof dep.remove === 'function') {
            dep.remove();
        }
    });
};
