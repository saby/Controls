import {constants, detection} from 'Env/Env';
import {isEqual} from 'Types/object';
import {SyntheticEvent} from 'UI/Vdom';
import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import BaseViewModel from '../BaseViewModel';
import {InputType, ISelection, ISplitValue, Tag} from './Types';
import {hasHorizontalScroll} from 'Controls/scroll';
import {ICallback, IFieldData} from '../interface/IValue';
import WorkWithSelection from './Field/WorkWithSelection';
import ChangeEventController, {IConfig as ChangeEventConfig} from './Field/ChangeEventController';
import MobileFocusController from './MobileFocusController';
import {
    split
} from 'Controls/_input/Base/InputUtil';
import {FixBugs} from '../FixBugs';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_input/resources/Field/Field';
import {splitValueForPasting, calculateInputType} from './Util';
import {delay as runDelayed} from 'Types/function';
import {IText} from 'Controls/decorator';

type EventName = 'valueChanged' | 'inputCompleted' | 'inputControl' | 'selectionStartChanged' | 'selectionEndChanged';
type ControllerName = 'changeEventController';

interface IModelData<Value, Options> {
    value?: Value;
    options?: Options;
    selection?: ISelection;
}

export interface IFieldOptions<Value, ModelOptions> extends IControlOptions {
    tag: Tag;
    name: string;
    inputCallback?: ICallback<Value>;
    readOnlyTemplate: TemplateFunction;
    model: BaseViewModel<Value, ModelOptions>;
}

/**
 *
 *
 * @interface Controls/_input/resources/Field
 * @public
 * @author Красильников А.С.
 */
export interface IField {
    readonly '[Controls/input:IField]': boolean;
}

/**
 * Контрол-обертка над нативными полями ввода. Используется для реализации контролов с вводом данных.
 * Если требуется готовый контрол с вводом текста используйте {@link Controls/_input/Text Controls.input:Text}
 *
 *
 * @class Controls/_input/resources/Field
 * @extends UI/Base:Control
 *
 * @public
 *
 * @author Красильников А.С.
 */
class Field<Value, ModelOptions>
    extends Control<IFieldOptions<Value, ModelOptions>>
    implements IField {
    private _currentVersionModel: number;
    private _changeEventController: ChangeEventController;
    private _workWithSelection: WorkWithSelection<void> = new WorkWithSelection<void>();

    protected _model: BaseViewModel<Value, ModelOptions>;
    protected _template: TemplateFunction = template;
    protected _isBrowserPlatform: boolean = constants.isBrowserPlatform;
    protected _inputKey: string;

    readonly '[Controls/input:IField]': boolean = true;

    constructor(cfg: IFieldOptions<Value, ModelOptions>) {
        super(cfg);

        this._selectionFromFieldToModel = this._selectionFromFieldToModel.bind(this);
    }

    /**
     * Метод получения DOM элемента поля ввода.
     * Если элемент отсутствует в верстке, то будет выброшена ошибка.
     */
    private _getField(): HTMLInputElement | null {
        const field: HTMLInputElement = this._children[this._options.name] as HTMLInputElement;

        if (field) {
            return field;
        }

        throw Error(
            'Не удалось определить DOM элемент поля ввода. ' +
            'Метод был вызван до монтирования контрола в DOM, ' +
            'или неправильно отработал механизм ядра по работе с _children.'
        );
    }

    private _getFieldSelection(): ISelection {
        const field: HTMLInputElement = this._getField();

        return {
            start: field.selectionStart,
            end: field.selectionEnd
        };
    }

    private _hasAutoFillField(): boolean {
        const field: HTMLInputElement = this._getField();
        const fieldValue: string = field.value;
        const modelValue: string = this._model.displayValue;

        return fieldValue !== '' && fieldValue !== modelValue;
    }

    private _updateModel(data: IModelData<Value, ModelOptions>): void {
        const model = this._model;

        if (data.value && data.value !== model.value) {
            model.value = data.value;
        }
        if (data.options && !isEqual(model.options, data.options)) {
            model.options = data.options;
        }
        if (data.selection && !isEqual(model.selection, data.selection)) {
            model.selection = data.selection;
        }
    }

    private _updateField(value: string, selection: ISelection): void {
        this.setValue(value);
        this.setSelectionRange(selection.start, selection.end);
        this._currentVersionModel = this._model.getVersion();
    }

    private _selectionFromFieldToModel(): void {
        const fieldSelection: ISelection = this._getFieldSelection();
        const selection: ISelection = {...this._model.selection};
        this._updateModel({
            selection: fieldSelection
        });
        this._notifySelection(selection);
    }

    private _getArgsForEvent(name: EventName): unknown[] {
        const model = this._model;
        switch (name) {
            case 'valueChanged':
                return [model.value, model.displayValue];
            case 'inputCompleted':
                return [model.value, model.displayValue];
            case 'inputControl':
                return [model.value, model.displayValue, model.selection];
            case 'selectionStartChanged':
                return [model.selection.start];
            case 'selectionEndChanged':
                return [model.selection.end];
        }
    }

    private _getConfigForController(name: ControllerName): ChangeEventConfig {
        switch (name) {
            case 'changeEventController':
                // Нужно отдавать model, а не displayValue. Например, строка поиска наследуется от Input:Base и сама
                // реализует опцию trim. В этом случае displayValue меняется в родителе и нам нужно получить
                // новое значение.
                return {
                    tag: this._options.tag,
                    model: this._model
                } as ChangeEventConfig;
        }
    }

    private _notifyEvent(name: EventName): void {
        this._notify(name, this._getArgsForEvent(name));
    }

    private _handleInput(splitValue: ISplitValue, inputType: InputType): void {
        const displayValue: string = this._model.displayValue;
        const value: string = this._model.value;
        const selection: ISelection = {...this._model.selection};

        if (this._model.handleInput(splitValue, inputType)) {
            if (this._options.inputCallback) {
                const formattedText: IFieldData = this._options.inputCallback({
                    value: this._model.value,
                    position: this._model.selection.start,
                    displayValue: this._model.displayValue
                });

                this._model.displayValue = formattedText.displayValue;
                this._model.selection = {
                    start: formattedText.position,
                    end: formattedText.position
                };
            }

            if (this._model.isValueChanged(displayValue, value)) {
                this._notifyEvent('valueChanged');
            }
            this._notifySelection(selection);
        }
        this._notifyEvent('inputControl');
    }

    private _updateByModel(): void {
        const model = this._model;
        const field = this._getField();
        const versionModel = model.getVersion();
        /**
         * Обновляемся по данным модели только в случае, если она поменяла версию с
         * момента последнего обновления.
         */
        const shouldBeChanged = this._currentVersionModel !== versionModel;
        if (shouldBeChanged) {
            this._updateField(model.displayValue, model.selection);

            if (
                WorkWithSelection.isFieldFocused(field) && !field.readOnly &&
                this._options.recalculateLocationVisibleArea
            ) {
                this._options.recalculateLocationVisibleArea(field, model.displayValue, model.selection);
            }
            this._currentVersionModel = versionModel;
        }
    }

    private _notifySelection(selection: ISelection): void {
        if (!isEqual(selection, this._model.selection)) {
            this._notifyEvent('selectionStartChanged');
            this._notifyEvent('selectionEndChanged');
        }
    }

    /**
     * BEGIN OF LIFE CIRCE SECTION
     */
    protected _beforeMount(options: IFieldOptions<Value, ModelOptions>): void {
        this._model = options.model;
        this._currentVersionModel = this._model.getVersion();
        this._changeEventController = new ChangeEventController(
            this._model.displayValue,
            this._notifyEvent.bind(this, 'inputCompleted')
        );
        this._fixBugs = new FixBugs({
            updatePositionCallback: () => {
                return this.setSelectionRange(this._model.selection.start, this._model.selection.end);
            }
        }, this);
        this._fixBugs.beforeMount();
        if (this._isBrowserPlatform) {
            this._inputKey = '_inputKey_' + Date.now();
        }
    }

    protected _afterMount(options: IFieldOptions<Value, ModelOptions>): void {
        const field: HTMLInputElement = this._getField();
        if (this._hasAutoFillField()) {
            this._model.displayValue = field.value;
            this._notifyEvent('valueChanged');
        }
        this._fixBugs.afterMount();
    }

    protected _beforeUpdate(options: IFieldOptions<Value, ModelOptions>): void {
        const currentDisplayValue: string = this._model.displayValue;
        if (this._model.displayValueBeforeUpdate !== currentDisplayValue) {
            this._changeEventController.fixed(currentDisplayValue);
        }
        this._updateByModel();
        this._fixBugs.beforeUpdate(this._options, options);
    }

    protected _afterUpdate(): void {
        this._fixBugs.afterUpdate();
    }

    protected _beforeUnmount(): void {
        super._beforeUnmount();

        this._selectionFromFieldToModel = undefined;
    }

    /**
     * END OF LINE CIRCLE SECTION
     */

    /**
     * BEGIN OF HANDLERS SECTION
     */
    protected _inputHandler(event: SyntheticEvent<KeyboardEvent>): void {
        const field = this._getField();
        const model = this._model;
        const data = this._fixBugs.dataForInputProcessing({
            oldSelection: model.selection,
            newPosition: field.selectionEnd,
            newValue: field.value,
            oldValue: model.displayValue
        });
        const value = data.oldValue;
        const newValue = data.newValue;
        const selection = data.oldSelection;
        const position = data.newPosition;

        const text: IText = {
            value: newValue,
            carriagePosition: position
        };
        const nativeInputType = event.nativeEvent.inputType;
        const inputType: InputType = calculateInputType(value, selection, text, nativeInputType);
        const splitValue: ISplitValue = split(value, newValue, position, selection, inputType);

        this._handleInput(splitValue, inputType);

        /**
         * Некоторые браузеры предоставляют возможность пользователю выбрать значение из предложенного списка.
         * Список формируется на основе введенного слова, путем попытки предугадать, какое слово вы пытаетесь набрать.
         * Выбранное значение полностью заменяет введенное слово.
         * Опытным путем удалось определить, что после ввода возможны 2 сценария:
         * 1. Каретка стоит в конце слова. Свойство selectionStart = selectionEnd = конец слова. Например, устройство ASUS_Z00AD, Android 5, браузер chrome.
         * 2. Слово выделено целиком. Свойство selectionStart = 0, а selectionEnd = конец слова. Например, устройство ASUS_Z00AD, Android 5, встроенный браузер.
         * Данные в первом случае ничем не отличаются от обычного ввода, поэтому он не вызывает проблем.
         * Разберем работу контрола во втором случае. Контрол всегда должен отображаться в соответствии со своей моделью.
         * После ввода selectionStart в модели равен текущей позиции каретки, а у поля, как говорилось ранее, selectionStart = 0. Из-за этого контрол будет менять выделение.
         * В этом случае возникает нативный баг. Он проявляется в том, что последующего ввода символов не происходит. https://jsfiddle.net/fxzsqug4/1/
         * Чтобы избавиться от бага, нужно поставить операцию изменения выделение в конец стека.
         * Например, можно воспользоваться setTimeout. https://jsfiddle.net/fxzsqug4/2/
         * Однако, можно просто не синхронизироваться с моделью во время обработки события input.
         * Потому что модель синхронизируется с полем во время цикла синхронизации, если изменения
         * не были применены. Такой подход увеличит время перерисоки,
         * но в местах с багом этого визуально не заметно.
         */
        if (!detection.isMobileAndroid) {
            this._updateField(model.displayValue, model.selection);
        }
    }

    protected _selectHandler(): void {
        this._workWithSelection.call(this._selectionFromFieldToModel);
    }

    protected _clickHandler(): void {
        /**
         * If the value in the field is selected, when you click on the selected area,
         * the cursor in the field is placed after the event. https://jsfiddle.net/wv9o4xmd/
         * Therefore, we remember the selection from the field at the next drawing cycle.
         */
        runDelayed(() => {
            if (this._destroyed) {
                return;
            }
            this._selectionFromFieldToModel();
            this._currentVersionModel = this._model.getVersion();
        });
    }

    protected _keyDownHandler(event: SyntheticEvent<KeyboardEvent>): void {
        this._changeEventController.keyDownHandler(event, this._getConfigForController('changeEventController'));
    }

    protected _keyUpHandler(event: SyntheticEvent<KeyboardEvent>): void {
        const processedKeys: string[] = [
            'End', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            // Поддержка значений key в IE
            'Left', 'Right', 'Up', 'Down'
        ];

        if (processedKeys.includes(event.nativeEvent.key)) {
            this._selectionFromFieldToModel();
        }
    }

    protected _blurHandler(event: SyntheticEvent<FocusEvent>): void {
        const field: HTMLInputElement = this._getField();

        /**
         * Защита от случая, когда фокус ушёл с поля из-за удаления из DOM.
         */
        if (!field) {
            return;
        }

        /**
         * После ухода фокуса поле должно быть проскролено в начало.
         * Браузеры работают по разному, chrome прокручивает, а ie и firefox нет.
         * Дулаем прокрутку на уровне контрола для унификации поведения.
         */
        field.scrollLeft = 0;

        this._changeEventController.blurHandler(event, this._getConfigForController('changeEventController'));
        MobileFocusController.blurHandler(event);
    }

    protected _touchStartHandler(event: SyntheticEvent<TouchEvent>): void {
        MobileFocusController.touchStartHandler(event);
    }

    protected _focusHandler(event: SyntheticEvent<FocusEvent>): void {
        MobileFocusController.focusHandler(event);
        this._fixBugs.focusHandler(event);
    }

    protected _mouseDownHandler(): void {
        this._fixBugs.mouseDownHandler();
    }

    /**
     * END OF HANDLERS SECTION
     */

    setValue(value: string): boolean {
        const field: HTMLInputElement = this._getField();

        if (field.value === value) {
            return false;
        }

        field.value = value;
        return true;
    }

    setCaretPosition(caretPosition: number): boolean {
        return this.setSelectionRange(caretPosition, caretPosition);
    }

    setSelectionRange(start: number, end: number): boolean {
        const field: HTMLInputElement = this._getField();
        const selection: ISelection = {start, end};

        this._notifySelection(selection);

        return this._workWithSelection.setSelectionRange(field, selection);
    }

    getFieldData<T>(name: string): T {
        return this._getField()[name];
    }

    hasHorizontalScroll(): boolean {
        return hasHorizontalScroll(this._getField());
    }

    scrollTo(scrollTop: number): void {
        this._getField().scrollTop = scrollTop;
    }

    paste(text: string): void {
        const splitValue: ISplitValue = splitValueForPasting(this._model.displayValue, this._model.selection, text);

        this._handleInput(splitValue, 'insert');
    }

    static _theme: string[] = ['Controls/input'];

    static getOptionTypes(): Partial<Record<keyof IFieldOptions<string, {}>, Function>> {
        return {
            tag: descriptor(String),
            name: descriptor(String).required()
        };
    }

    static getDefaultOptions(): Partial<IFieldOptions<string, {}>> {
        return {
            tag: 'input'
        };
    }
}

export default Field;
