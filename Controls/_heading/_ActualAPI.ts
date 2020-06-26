import {IBackOptions} from './Back';
import {Logger} from "UI/Utils";

export function counterSize(size: 's' | 'm' | 'l', fontSize: string): string {
    if (fontSize) {
        return fontSize;
    } else {
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.heading.Back: Используется устаревшая опция size. ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на опцию fontSize.');*/
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
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.heading.Counter: Используется устаревшая опция style. ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на опцию fontColorStyle.');*/
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
    if (options.size !== undefined) {
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.heading.Back: Используется устаревшая опция size. ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на опции fontSize и iconSize');*/
    }
    return {
        fontSize: options.fontSize || backSizeOptions(options.size) ,
        iconSize: options.iconSize || options.size
    };
}

export function backStyleOptions(style: 'primary' | 'secondary'): { fontColorStyle: string, iconStyle: string } {
    if (style === 'secondary') {
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.heading.Back: Используется устаревшая опция style="secondary". ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на fontColorStyle: "secondary", iconStyle: "primary".');*/
        return {
            fontColorStyle: 'secondary', iconStyle: 'primary'
        };
    } else {
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.heading.Back: Используется устаревшая опция style="primary". ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на fontColorStyle: "primary", iconStyle: "secondary".');*/
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
