import {Model} from 'Types/entity';
import {getWidth} from 'Controls/sizeUtils';
import {hasHorizontalScroll as hasHorizontalScrollUtil} from 'Controls/scroll';

const typographyStyles = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'textTransform',
    'wordSpacing',
    'textIndent'
];

/**
 * Интерфейс опций контроллера редактирования по месту.
 * @interface Controls/_editInPlace/InputActivationHelper
 * @author Родионов Е.А.
 */

export class InputActivationHelper {
    private _clickItemInfo?: {
        clientX: number,
        clientY: number,
        item: Model
    };
    private _shouldActivate: boolean;
    private _paramsForFastEdit?: {container: HTMLDivElement | HTMLTableSectionElement, selector: string};

    /**
     * Сохраняет метаинформацию о месте клика по записи
     */
    setClickInfo(event: MouseEvent, item: Model): void {
        if (this._clickItemInfo && this._clickItemInfo.item === item) {
            return;
        }
        this._clickItemInfo = {
            clientX: event.clientX,
            clientY: event.clientY,
            item
        };
    }

    /**
     * Сохраняет информацию о необходимости ставить фокус
     */
    shouldActivate(): void {
        this._shouldActivate = true;
    }

    /**
     * Устанавливает фокус в поле ввода.
     */
    activateInput(activateRowCallback: Function): void {
        if (!(this._clickItemInfo || this._shouldActivate || this._paramsForFastEdit)) {
            return;
        }

        const reset = () => {
            this._clickItemInfo = null;
            this._shouldActivate = false;
            this._paramsForFastEdit = null;
        };

        if (this._clickItemInfo) {
            if (this._tryActivateByClickInfo()) {
                reset();
            } else {
                if (this._shouldActivate) {
                    if (activateRowCallback()) {
                        reset();
                    }
                }
            }
        } else if (this._paramsForFastEdit) {
            const input = this._paramsForFastEdit.container.querySelector(this._paramsForFastEdit.selector);
            if (!input) {
                /*
                Если не удалось найти input, на который нужно навести фокус, то пытаемся найти 1 найденый input
                 */
                const selectors = this._paramsForFastEdit.selector.split(' ');
                const selector = `${selectors[0]} ${selectors[selectors.length - 1]}`;
                input = this._paramsForFastEdit.container.querySelector(selector);
            }
            if (input) {
                input.focus();
                reset();
            }
        } else if (this._shouldActivate && activateRowCallback()) {
            reset();
        }
    }

    /**
     * Сохраняет информацию о поле ввода, в которое необходимо ставить фокус
     */
    setInputForFastEdit(currentTarget: HTMLElement, direction: 'top' | 'bottom'): void {
        // Ячейка, с которй уходит фокус
        const cell = currentTarget.closest('.controls-Grid__row-cell');
        if (!cell) { return; }

        let input;
        let inputClass;
        const inputPrefix = 'js-controls-Grid__editInPlace__input-';

        // Поле ввода с которого уходит фокус
        do {
            input = input ? input.parentNode : currentTarget;
            inputClass = Array.prototype.find.call(input.classList, (className) => className.indexOf(inputPrefix) >= 0);
        } while (cell !== input && !inputClass);

        if (input === cell) {
            return;
        }

        // Получение индекса строки в которой продолжится редактирование
        const container = currentTarget.closest('.controls-GridViewV__itemsContainer');
        const currentRow = currentTarget.closest('.controls-Grid__row');
        const currentRowIndex = Array.prototype.indexOf.call(container.children, currentRow);
        const nextRowIndex = currentRowIndex + 1 + (direction === 'top' ? -1 : 1);

        // Получение индекса колонки в которой продолжится редактирование
        const columnIndex = 1 + Array.prototype.indexOf.call(currentRow.children, cell);

        this._paramsForFastEdit = {
            container: container as HTMLTableSectionElement | HTMLDivElement,
            selector: `.controls-Grid__row:nth-child(${nextRowIndex}) .controls-Grid__row-cell:nth-child(${columnIndex}) .${inputClass} input`
        };
    }

    private _tryActivateByClickInfo(): boolean {
        type TEditable = HTMLInputElement | HTMLTextAreaElement;
        const target = document.elementFromPoint(this._clickItemInfo.clientX, this._clickItemInfo.clientY) as TEditable;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        // Выполняем корректировку выделения только в случае пустого выделения
        // (учитываем опцию selectOnClick для input-контролов).
        // https://online.sbis.ru/opendoc.html?guid=904a460a-02da-46a7-bb61-5e0ed2dc4375
        const isEmptySelection = isInput && (target.selectionStart === target.selectionEnd);

        if (isInput && isEmptySelection) {
            const fakeElement = document.createElement('div');
            fakeElement.innerText = '';

            const targetStyle = getComputedStyle(target);
            const hasHorizontalScroll = hasHorizontalScrollUtil(target);

            /*
             Если элемент выравнивается по правому краю, но при этом влезает весь текст, то нужно рассчитывать
             положение курсора от правого края input'а, т.к. перед текстом может быть свободное место.
             Во всех остальных случаях нужно рассчитывать от левого края, т.к. текст гарантированно прижат к нему.
             */
            let offset;
            if (targetStyle.textAlign === 'right' && !hasHorizontalScroll) {
                offset = target.getBoundingClientRect().right - this._clickItemInfo.clientX;
            } else {
                offset = this._clickItemInfo.clientX - target.getBoundingClientRect().left;
            }
            typographyStyles.forEach((prop) => {
                fakeElement.style[prop] = targetStyle[prop];
            });
            let i = 0;
            let currentWidth;
            let previousWidth;
            for (; i < target.value.length; i++) {
                currentWidth = getWidth(fakeElement);
                if (currentWidth > offset) {
                    break;
                }
                if (targetStyle.textAlign === 'right' && !hasHorizontalScroll) {
                    fakeElement.innerText = target.value.slice(target.value.length - 1 - i);
                } else {
                    fakeElement.innerText += target.value[i];
                }
                previousWidth = currentWidth;
            }

            /**
             * When editing starts, EditingRow calls this.activate() to focus first focusable element.
             * But if a user has clicked on an editable field, we can do better - we can set caret exactly
             * where the user has clicked. But before moving the caret we should manually focus the right field.
             */
            target.focus();

            const lastLetterWidth = currentWidth - previousWidth;
            if (targetStyle.textAlign === 'right' && !hasHorizontalScroll) {
                if (currentWidth - offset < lastLetterWidth / 2) {
                    target.setSelectionRange(target.value.length - i, target.value.length - i);
                } else {
                    target.setSelectionRange(target.value.length - i + 1, target.value.length - i + 1);
                }
            } else if (currentWidth - offset < lastLetterWidth / 2) {
                target.setSelectionRange(i, i);
            } else {
                target.setSelectionRange(i - 1, i - 1);
            }

            target.scrollLeft = 0;
            return true;
        }
        return false;
    }
}
