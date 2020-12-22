import {TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';
import {detection, constants} from 'Env/Env';
import {descriptor} from 'Types/entity';
import {delay as runDelayed} from 'Types/function';

import {IAreaOptions} from 'Controls/_input/interface/IArea';
import Text from 'Controls/_input/Text';
import {processKeydownEvent} from 'Controls/_input/resources/Util';
import {ResizeObserverUtil} from 'Controls/sizeUtils';
import template = require('wml!Controls/_input/Area/Area');
import fieldTemplate = require('wml!Controls/_input/Area/Field');
import readOnlyFieldTemplate = require('wml!Controls/_input/Area/ReadOnly');
import 'Controls/decorator';

/**
 * Многострочное поле ввода текста.
 * @remark
 * Вы можете настроить {@link minLines минимальное} и {@link maxLines максимальное} количество строк.
 * Когда вводимый текст превысит ограничение {@link maxLines}, в поле появится скролл и оно перестанет увеличиваться по высоте.
 * Вы можете переместить текст в следующую строку с помощью {@link newLineKey горячих клавиш}.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/input/text/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Area
 * @extends Controls/input:Text
 * @mixes Controls/input:INewLineKey
 * @mixes Controls/_input/interface/IArea
 * @public
 *
 * @demo Controls-demo/Input/Area/MinMaxLines/Index
 *
 * @author Красильников А.С.
 */

export default class Area extends Text<IAreaOptions> {
    protected _template: TemplateFunction = template;

    protected _multiline: boolean = true;
    protected _resizeObserver: ResizeObserverUtil;
    protected _minLines: number;
    protected _maxLines: number;
    protected _controlName: string = 'Area';

    protected _syncBeforeMount(options: IAreaOptions): void {
        super._syncBeforeMount(options);
        this._validateLines(options.minLines, options.maxLines);
    }

    protected _afterMount(): void {
        this._resizeObserver = new ResizeObserverUtil(
            this, this._resizeObserverCallback.bind(this));
        this._resizeObserver.observe(this._container);
    }

    protected _beforeUpdate(newOptions: IAreaOptions): void {
        super._beforeUpdate.apply(this, arguments);

        if (this._options.minLines !== newOptions.minLines || this._options.maxLines !== newOptions.maxLines) {
            this._validateLines(newOptions.minLines, newOptions.maxLines);
        }
    }

    protected _beforeUnmount(): void {
        super._beforeUnmount.apply(this, arguments);
        this._resizeObserver.terminate();
    }

    protected _inputHandler(): void {
        super._inputHandler.apply(this, arguments);

        this._fixSyncFakeArea();

        this._recalculateLocationVisibleArea(null, this._viewModel.displayValue, this._viewModel.selection);
    }

    private _updateFieldInTemplate(): void {
        super._updateFieldInTemplate.apply(this, arguments);
        this._fixSyncFakeArea();
    }

    private _resizeObserverCallback(): void {
        this._notify('controlResize', [], {bubbling: true});
    }

    protected _keyDownHandler(event: SyntheticEvent<KeyboardEvent>): void {
        const additionalProcessedKeys = ['Up', 'Down'];
        processKeydownEvent(event, additionalProcessedKeys);
        this._newLineHandler(event, true);
    }

    protected _keyPressHandler(event: SyntheticEvent<KeyboardEvent>): void {
        this._newLineHandler(event, false);
    }

    protected _keyUpHandler(event: SyntheticEvent<KeyboardEvent>): void {
        this._newLineHandler(event, false);

        /**
         * После нажатия на стрелки клавиатуры, происходит перемещение курсора в поле.
         * В результате перемещения, курсор может выйти за пределы видимой области, тогда произойдет
         * прокрутка в scroll:Container. Отступы не учитываются при прокрутке. Поэтому, когда курсор
         * находится в начале или в конце, тогда scroll:Container не докручивается, остается тень.
         * В такой ситуации будем докручивать самостоятельно.
         */
        const keyCode = event.nativeEvent.keyCode;
        if (keyCode >= constants.key.end && keyCode <= constants.key.down) {
            const container: HTMLElement = this._children.fakeField;
            const textBeforeCursor: string = this._viewModel.displayValue.substring(0, this._viewModel.selection.end);
            const cursorPosition: number = this._calcPositionCursor(container, textBeforeCursor);
            const firstLinePosition: number = this._calcPositionCursor(container, '');
            const lastLinePosition: number = container.offsetHeight;

            if (cursorPosition === firstLinePosition) {
                this._children.scroll.scrollTo(0);
            } else if (cursorPosition === lastLinePosition) {
                this._children.scroll.scrollTo(this._getField().getFieldData('offsetHeight'));
            }
        }
    }

    /**
     * Изменение расположения видимой области поля так, чтобы отобразился курсор.
     * Если курсор виден, расположение не изменяется. В противном случае новое местоположение будет таким, что курсор отобразится в середине области.
     */
    private _recalculateLocationVisibleArea(field: HTMLElement, value: string, selection: object): void {
        const scroll = this._children.scroll;
        const textBeforeCursor = value.substring(0, selection.end);

        const positionCursor = this._calcPositionCursor(this._children.fieldWrapper, textBeforeCursor);

        /**
         * По другому до clientHeight не достучаться.
         * https://online.sbis.ru/opendoc.html?guid=1d24c04f-73d0-4e0f-9b61-4d0bc9c23e2f
         */
            // TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        const container = scroll._container.get ? scroll._container.get(0) : scroll._container;
        const sizeVisibleArea = container.clientHeight;

        // По другому до scrollTop не достучаться.
        // https://online.sbis.ru/opendoc.html?guid=e1770341-9126-4480-8798-45b5c339a294
        const beginningVisibleArea = scroll._children.content.scrollTop;

        const endingVisibleArea = beginningVisibleArea + sizeVisibleArea;

        /**
         * The cursor is visible if its position is between the beginning and the end of the visible area.
         */
        const hasVisibilityCursor = beginningVisibleArea < positionCursor && positionCursor < endingVisibleArea;

        if (!hasVisibilityCursor) {
            /**
             * At the time of the scroll position change, the DOM must be updated.
             * So wait until the control redraws.
             */
            runDelayed(() => {
                this._getField().scrollTo(0);
                scroll.scrollTo(positionCursor - sizeVisibleArea / 2);
            });
        }
    }

    private _initProperties(options: IAreaOptions): void {
        super._initProperties.apply(this, arguments);

        this._field.template = fieldTemplate;
        this._readOnlyField.template = readOnlyFieldTemplate;

        /**
         * https://stackoverflow.com/questions/6890149/remove-3-pixels-in-ios-webkit-textarea
         */
        const verWithFixedBug: number = 13;
        this._field.scope.fixTextPosition = detection.isMobileIOS && detection.IOSVersion < verWithFixedBug;
    }

    private _calcPositionCursor(container: HTMLElement, textBeforeCursor: string): number {
        const measuredBlock: HTMLElement = document.createElement('div');

        /**
         * In order for the block to have the correct height, you need to add an empty character to the end.
         * Without it, the height, in the case of an empty value, will be zero.
         * In the case when at the end of the transition to a new line height will be one line less.
         */
        measuredBlock.innerText = textBeforeCursor + '&#65279;';
        container.appendChild(measuredBlock);
        const position: number = measuredBlock.clientHeight;
        container.removeChild(measuredBlock);

        return position;
    }

    /**
     * @param event
     * @param {String} [key]
     * @variant altKey
     * @variant ctrlKey
     * @variant shiftKey
     * @return {Boolean}
     */
    private _isPressAdditionalKey(event: KeyboardEvent, key: string): boolean {
        const additionalKeys: string[] = ['shiftKey', 'altKey', 'ctrlKey'];

        return additionalKeys.every((additionalKey) => {
            if (additionalKey === key) {
                return event[additionalKey];
            }

            return !event[additionalKey];
        });
    }

    private _isPressEnter(event: KeyboardEvent): boolean {
        return event.keyCode === constants.key.enter;
    }

    private _isPressCtrl(event: KeyboardEvent): boolean {
        return this._isPressAdditionalKey(event, 'ctrlKey');
    }

    private _isPressAdditionalKeys(event: KeyboardEvent): boolean {
        return !this._isPressAdditionalKey(event);
    }

    private _validateLines(min: number, max: number): void {
        let validated = true;
        this._minLines = min;
        this._maxLines = max;

        if (min > max) {
            validated = false;
            this._minLines = max;
            this._maxLines = min;
            Logger.error('The minLines and maxLines options are not set correctly. ' +
                'The minLines more than the maxLines.', this);
        }

        if (min < 1) {
            validated = false;
            this._minLines = 1;
            Logger.error('The minLines options are not set correctly. The minLines less than one.', this);
        }

        if (max < 1) {
            validated = false;
            this._maxLines = 1;
            Logger.error('The maxLines options are not set correctly. The maxLines less than one.', this);
        }

        if (min > 10 || max > 10) {
            validated = false;
            this._minLines = 10;
            this._maxLines = 10;
            Logger.error('The minLines and maxLines options are not set correctly.' +
                ' Values greater than 10 are not supported.', this);
        }
    }

    private _newLineHandler(event: SyntheticEvent<KeyboardEvent>, isNewLinePaste: boolean): void {
        /**
         * If a new line is added, then stop the bubbling of the event.
         * Because, only we should respond to the addition of a new line.
         */
        if (this._isPressEnter(event.nativeEvent)) {
            if (this._options.newLineKey === 'ctrlEnter' && this._isPressCtrl(event.nativeEvent)) {
                if (isNewLinePaste) {
                    this.paste('\n');
                }
                event.stopPropagation();
            } else if (this._options.newLineKey !== 'enter' || this._isPressAdditionalKeys(event.nativeEvent)) {
                event.preventDefault();
            } else {
                event.stopPropagation();
            }
        }
    }

    private _fixSyncFakeArea(): void {
        /**
         * 1) На MacOS иногда между выпонением обработчика и перерестроением успевает перерисоваться страница. Из-за этого происходят скачки.
         * 2) В chrome иногда, когда происходит увеличение количества строк, при вставке, не происходит отрисовки текста на новых строках.
         * Значение в textarea меняется в обработчике события input, а значение в fakeField в шаблоне на момент перестроения.
         * Так как размеры textarea зависят от fakeField, поэтому их значения на момент перерисовки страници должны быть одинаковыми. Иначе
         * возникают проблемы 1-2. Чтобы избежать проблем меняем значение fakeField в обработчике.
         */
        if (detection.isMacOSDesktop || detection.chrome) {
            this._children.fakeField.innerText = this._viewModel.displayValue + this._field.scope.emptySymbol;
        }
    }

    static _theme: string[] = Text._theme.concat(['Controls/input']);

    static getDefaultOptions(): object {
        const defaultOptions = Text.getDefaultOptions();

        defaultOptions.minLines = 1;
        defaultOptions.newLineKey = 'enter';
        // В темной теме розницы у полей ввода нестандартный фон
        defaultOptions.shadowMode = 'js';

        return defaultOptions;
    }

    static getOptionTypes(): object {
        const optionTypes = Text.getOptionTypes();

        optionTypes.minLines = descriptor(Number, null);
        optionTypes.maxLines = descriptor(Number, null);
        optionTypes.newLineKey = descriptor(String).oneOf([
            'enter',
            'ctrlEnter'
        ]);

        return optionTypes;
    }
}
