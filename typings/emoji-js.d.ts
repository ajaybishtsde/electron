namespace JSEmoji {
    export type CondensedEmojiData = [
        Array<string>,      // 0 = array unicode points
        string,             // 1 = string softbank alt unicode
        string,             // 2 = string google alt unicode
        Array<string>,      // 3 = array short names
        number,             // 4 = number sheet x
        number,             // 5 = number sheet y
        number,             // 6 = number mask
        string | boolean,   // 7 = string/bool path to image
        string,             // 8 = string category
        number              // 9 = number category sort position
    ];

    export type ImageSet = {
        path: string;
        sheet: string;
        mask: number;
    };

    export type Image = {
        path: string;
        sheet: string;
        px: number;
        py: number;
        full_idx: string;
        is_var: boolean;
    }    

    export type ReplaceModeType = 'img' | 'softbank' | 'unified' | 'google' | 'css';

    declare class EmojiConverter {
        img_set: string;
        img_sets: { [name: string]: ImageSet };
        use_css_images: boolean;
        colons_mode: boolean;
        text_mode: boolean;
        include_title: boolean;
        include_text: boolean;
        allow_native: boolean;
        use_sheet: boolean;
        avoid_ms_emoji: boolean;
        allow_caps: boolean;
        img_suffix: string;
        sheet_size: number;
        replace_mode: ReplaceModeType;

        map: {
            colons: { [shortName: string]: string };
            emoticons: { [em: string]: string };
        };
        data: { [idx: string]: CondensedEmojiData };
        emoticons_data: { [ascii: string]: string };
        variations_data: {
            [idx: string]: {
                [varIdx: string]: CondensedEmojiData;
            };
        };

        noConflict();
        init_emoticons();
        init_colons();
        init_unified();
        init_env();        
        replace_emoticons(str: string): string;
        replace_emoticons_with_colons(str: string): string;
        replace_colons(str: string): string;
        replace_unified(str: string): string;
        addAliases(map: { [name: string]: string });
        removeAliases(list: Array<string>);
        find_image(idx: string, varIdx?: string): Image;
    }
}

declare module "emoji-js" {
    export = JSEmoji.EmojiConverter;
}