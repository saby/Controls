import {detection} from 'Env/Env';
import {IText, pasteWithRepositioning} from 'Controls/decorator';
import {IInputData} from '../Base/InputUtil';

/**
 * Класс для исправления бага не правильной обработки ввода при вводе двух дефисов подряд на IPad.
 * Причина: существует фича на IPad`aх до 13 версии, что при вводе двух минусов, они заменяются на ТИРЕ.
 * В зависимости от поведения обработки ввода, первый минус может быть удален. Система это не учитывает. Тогда при вводе второго минуса, удаляется
 * символ стоящий перед ним, и добавляется ДЕФИС.
 * Решение: следим за обработкой ввода. Когда будет введен ДЕФИС, тогда восстанавливаем удаленный сивмол и считаем, что ввели минус.
 */
export class MinusProcessing {
    inputProcessing(data: IInputData): IInputData {
        if (!MinusProcessing._isBug(data)) {
            return data;
        }

        const newText: IText = pasteWithRepositioning({
            value: data.oldValue,
            carriagePosition: data.oldSelection.end
        }, MinusProcessing.MINUS, data.oldSelection.end);

        return {
            oldValue: data.oldValue,
            oldSelection: data.oldSelection,
            newValue: newText.value,
            newPosition: newText.carriagePosition
        };
    }

    private static MINUS: string = '-';
    private static HYPHEN: string = '–';
    // tslint:disable-next-line:no-magic-numbers
    private static BUG_ON_DEVICE: boolean = detection.isMobileIOS && detection.IOSVersion < 13;

    private static _isBug(data: IInputData): boolean {
        const prevChar: string = data.newValue.substr(data.newPosition - 1, 1);
        return MinusProcessing.BUG_ON_DEVICE && prevChar === MinusProcessing.HYPHEN;
    }
}
