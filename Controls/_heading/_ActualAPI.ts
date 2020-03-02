import {IBackOptions} from './Back';

export function counterSize(size: 's' | 'm' | 'l', fontSize: string): string {
    if (fontSize) {
        return fontSize;
    } else {
        const fontSizesTable = {
            s: 'm',
            m: 'l',
            l: '3xl'
        };
        const result: string = fontSizesTable[size];
        return result || 'l';
    }
}

export function counterStyle(style: 'primary' | 'secondary' | 'disabled', fontColorStyle: string): string {
    if (fontColorStyle) {
        return fontColorStyle;
    } else {
        const fontStylesTable = {
            primary: 'primary',
            secondary: 'secondary',
            disabled: 'unaccented'
        };
        const result: string = fontStylesTable[style];
        return result || 'primary';
    }
}
export function backSizeOptions(size: string): string {
    const fontSizesTable = {
        s: 'l',
        m: '3xl',
        l: '4xl'
    };
    const result: string = fontSizesTable[size];
    return result || '3xl';
}

export function backSize(options: IBackOptions): { fontSize: string, iconSize: string } {
    return {
        fontSize: options.fontSize || backSizeOptions(options.size) ,
        iconSize: options.iconSize || options.size
    };
}

export function backStyleOptions(style: 'primary' | 'secondary'): { fontColorStyle: string, iconStyle: string } {
    if (style === 'secondary') {
        return {
            fontColorStyle: 'secondary', iconStyle: 'primary'
        };
    } else {
        return {
            fontColorStyle: 'primary', iconStyle: 'secondary'
        };
    }
}

export function backStyle(options: IBackOptions): { fontColorStyle: string, iconStyle: string } {
    return {
        fontColorStyle: options.fontColorStyle || backStyleOptions(options.style).fontColorStyle || 'primary',
        iconStyle: options.iconStyle || backStyleOptions(options.style).iconStyle || 'secondary'
    };
}
