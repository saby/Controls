import {Model} from 'Types/entity';
import {getWidth, hasHorizontalScroll as hasHorizontalScrollUtil} from 'Controls/sizeUtils';

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

export class InputActivationHelper {
    private _clickItemInfo?: {
        clientX: number,
        clientY: number,
        item: Model
    };
    private _shouldActivate: boolean;

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

    shouldActivate(): void {
        this._shouldActivate = true;
    }

    activateInput(activateRowCallback: Function): void {
        if (!(this._clickItemInfo || this._shouldActivate)) {
            return;
        }
        if (this._clickItemInfo) {
            if (this._tryActivateByClickInfo()) {
                this._clickItemInfo = null;
                this._shouldActivate = false;
            } else {
                if (this._shouldActivate) {
                    if (activateRowCallback()) {
                        this._shouldActivate = false;
                        this._clickItemInfo = null;
                    }
                }
            }
        } else if (this._shouldActivate && activateRowCallback()) {
            this._shouldActivate = false;
            this._clickItemInfo = null;
        }
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
