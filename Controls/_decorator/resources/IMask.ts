export interface IFormatMaskChars {
    [maskChar: string]: string;
}

export interface IMaskOptions {
    mask: string;
    replacer: string;
    formatMaskChars: IFormatMaskChars;
}

export function getDefaultMaskOptions(): Partial<IMaskOptions> {
    return {
        replacer: '',
        formatMaskChars: {
            L: '[А-ЯA-ZЁ]',
            l: '[а-яa-zё]',
            d: '[0-9]',
            x: '[А-ЯA-Zа-яa-z0-9ёЁ]'
        }
    };
}

export default interface IMask {
    readonly '[Controls/_input/interface/IMask]': boolean;
}
