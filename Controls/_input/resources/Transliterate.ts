import {ISelection} from './Types';
import {controller as i18Controller} from 'I18n/i18n';

export default function transliterate(value: string, selection: ISelection): Promise<string> {
    const text = value.slice(
        selection.start,
        selection.end
    ) || value;
    const firstLocale = i18Controller.currentLocale.indexOf('ru') !== -1 ? 'ru' : 'en';
    const secondLocale = firstLocale === 'ru' ? 'en' : 'ru';
    return import('I18n/keyboard').then(({changeLayout}) => {
        return changeLayout(text, firstLocale, secondLocale).then((firstRevertedText) => {
            if (firstRevertedText === text) {
                return changeLayout(text, secondLocale, firstLocale).then((secondRevertedText) => {
                    return transliterateSelectedText(secondRevertedText, value, selection);
                });
            } else {
                return transliterateSelectedText(firstRevertedText, value, selection);
            }
        });
    });
}

function transliterateSelectedText(
    revertedText: string,
    value: string,
    selection?: ISelection
): string {
    if (selection && selection.start !== selection.end) {
        return value.slice(0, selection.start) +
            revertedText +
            value.slice(selection.end, value.length);
    } else {
        return revertedText;
    }
}

// Для тестов
transliterate._transliterateSelectedText = transliterateSelectedText;
