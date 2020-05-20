import {IInputData} from '../Base/InputUtil';
import {IText, pasteWithRepositioning} from 'Controls/decorator';

/**
 * Класс для исправления бага не правильной вставки значения при перетаскивании.
 * Причина: во время фокусировки, позиция каретки может измениться. Подробнее в CarriagePositionWhenFocus.
 * Решение: пользовательское перетаскивание запускает события focus и input синхронно. Сохраним позицию
 * каретки на момент фокусировки, а затем удалим ассинхронно. Измененять нативную позицию перед обработкой нельзя!
 * Таким образом, если позиция каретки сохранена, на момент обработки ввода, значит произошло перетаскивание, тогда
 * модифицируем данные.
 */
export class InsertFromDrop {
    private _position: number | null = null;
    private _timeoutId: number | null = null;

    cancel(): void {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
        this._position = null;
    }

    focusHandler(event: FocusEvent): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        this._position = target.selectionEnd;
        this._timeoutId = setTimeout(() => {
           this._position = null;
        }, 0);
    }

    inputProcessing(data: IInputData): IInputData {
        if (this._position === null) {
            return data;
        }

        const insertLength: number = data.newPosition - data.oldSelection.end;
        const dropValue: string = data.newValue.substr(data.oldSelection.end, insertLength);
        const oldPosition = this._position;
        const newText: IText = pasteWithRepositioning({
            value: data.oldValue,
            carriagePosition: oldPosition
        }, dropValue, oldPosition);
        return {
            newValue: newText.value,
            oldValue: data.oldValue,
            newPosition: newText.carriagePosition,
            oldSelection: {
                start: oldPosition,
                end: oldPosition
            }
        };
    }
}
