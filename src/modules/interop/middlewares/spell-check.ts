import { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } from 'electron-spellchecker';
import { on, once } from 'yggdrasil/lib/event';
import { webFrame, remote } from 'electron';
import { PreferenceStateSlice, PREFERENCES } from '@modules/core/models/preference';
import * as PreferenceActions from '@modules/core/actions/preference';
import { MiddlewareAPI } from 'redux';
import { getPreference } from '@modules/core/selectors/preference';
import { Dispatch } from 'redux';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:middlewares:spellcheck`);

// todo: hack part #1 disable spell-checking without recreating everything
const DISABLED_SPELL_CHACK_HANDLER = Object.freeze({ currentSpellchecker: false });

let spellCheckHandler: any = DISABLED_SPELL_CHACK_HANDLER;
const contextMenuBuilder = new ContextMenuBuilder(spellCheckHandler);
const contextMenuListener = new ContextMenuListener((info) => {
    contextMenuBuilder.showPopupMenu(info);
});

export const spellCheck = () => (store: MiddlewareAPI<Dispatch, PreferenceStateSlice>): any => {
    let prevUseSpellCheck: boolean;
    let owned: Array<{ unsubscribe() }> = [];

    const updateSpellCheckProvider = (useSpellCheck: boolean) => {
        debug(`spell-check ${useSpellCheck ? 'ENABLED' : 'DISABLED'}`);
        if (prevUseSpellCheck === useSpellCheck) {
            return;
        }

        prevUseSpellCheck = useSpellCheck;

        if (useSpellCheck) {
            spellCheckHandler = new SpellCheckHandler();
            spellCheckHandler.switchLanguage('en-US');
            spellCheckHandler.attachToInput();

            owned.push(spellCheckHandler);
        } else {
            spellCheckHandler = DISABLED_SPELL_CHACK_HANDLER;

            owned.forEach(d => d.unsubscribe()), owned = [];

            // todo: hack part #2 to disable spell-checking (electron-spellchecker does not remove this)
            webFrame.setSpellCheckProvider('en-US', false, {
                spellCheck: () => true
            });
        }

        contextMenuBuilder.spellCheckHandler = spellCheckHandler;

        useSpellCheck = useSpellCheck;
    };

    updateSpellCheckProvider(!getPreference(store.getState(), PREFERENCES.noSpellCheck));

    return (next: Dispatch) => (action: PreferenceActions.ActionType) => {
        switch (action.type) {
            case PreferenceActions.SET_PREFERENCE:
            case PreferenceActions.SET_PREFERENCES: {
                // todo: should we have interop side preference sinks?
                const res = next(action);
                const nextUseSpellCheck = !getPreference(store.getState(), PREFERENCES.noSpellCheck);
                if (prevUseSpellCheck !== nextUseSpellCheck) {
                    updateSpellCheckProvider(nextUseSpellCheck);
                }
                return res;
            }
        }
        return next(action);
    };
};

export default spellCheck;
