import {Logger} from 'UI/Utils';

export function inlineHeight(size: string, inlineHeight: string): string {
    if (size) {
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.input: Используется устаревшая опция size. ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на опцию inlineHeight.');*/
        return size;
    }
    if (inlineHeight) {
        return inlineHeight;
    }
}

export function fontColorStyle(fontStyle: string, fontColorStyle: string): string {
    if (fontStyle) {
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.input: Используется устаревшая опция fontStyle. ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на опцию fontColorStyle.');*/
        return fontStyle;
    }
    if (fontColorStyle) {
        return fontColorStyle;
    }
}

export function fontSize(fontStyle: string, fontSize: string): string {
    if (fontStyle) {
        // TODO: будет удалено в версию после 5100
        // Раскоментирую в следующем реквесте, чтобы нормально прошла сборка engine.
        // https://online.sbis.ru/doc/ac1c07a5-68d7-465f-9e33-0d6a1c88ceeb
        /*Logger.error('Controls.input: Используется устаревшая опция fontStyle. ' +
            'Переход на актуальное API был по задаче https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be. ' +
            'Можете передать ошибку на Журавлева Максима со ссылкой на репозиторий и именем контрола, или поправить самостоятельно на опцию fontSize.');*/
        switch (fontStyle) {
            case 'primary':
            case 'secondary': return '3xl';
            case 'default':
            default: return 'm';
        }
    }
    if (fontSize) {
        return fontSize;
    }
}

export function validationStatus(style: string, validationStatus: string): string {
    if (validationStatus) {
        return validationStatus;
    }

    switch (style) {
        case 'invalid': return 'invalid';
        case 'info':
        default: return 'valid';
    }
}

export function heightLine(size: string, fontSize: string): string {
    if (size) {
        switch (size) {
            case 's': return 's';
            case 'l': return 'l';
            case 'm':
            case 'default':
            default: return 'm';
        }
    }
    if (fontSize) {
        return fontSize;
    }
}
