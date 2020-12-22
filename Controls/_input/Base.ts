import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {detection, constants} from 'Env/Env';
import {descriptor} from 'Types/entity';
import {EventUtils} from 'UI/Events';
import {isEqual} from 'Types/object';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as ViewModel from 'Controls/_input/Base/ViewModel';
import * as unEscapeASCII from 'Core/helpers/String/unEscapeASCII';
import {hasHorizontalScroll} from 'Controls/scroll';
import {processKeydownEvent} from 'Controls/_input/resources/Util';
import {IBaseOptions} from 'Controls/_input/interface/IBase';
import template = require('wml!Controls/_input/Base/Base');
import fieldTemplate = require('wml!Controls/_input/Base/Field');
import readOnlyFieldTemplate = require('wml!Controls/_input/Base/ReadOnly');
import Field from 'Controls/_input/resources/Field';
import {IViewModelOptions} from 'Controls/_input/Text/ViewModel';

import {getOptionPaddingTypes, getDefaultPaddingOptions} from './interface/IPadding';

import 'wml!Controls/_input/Base/Stretcher';
import 'wml!Controls/_input/Base/FixValueAttr';

interface IFieldTemplate {
    template: string|TemplateFunction;
    scope: {
        emptySymbol?: string;
        controlName?: string;
        autoComplete?: boolean|string;
        ieVersion?: number | null;
        isFieldFocused?: () => boolean;

        value?: string;
        options?: any;
        autoWidth?: boolean;
    };
}
export interface IBaseInputOptions extends IBaseOptions, IControlOptions {}
/**
 * @type {Number} The width of the cursor in the field measured in pixels.
 * @private
 */
const WIDTH_CURSOR: number = 1;

/**
 * Базовый класс для текстовых полей ввода.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Base
 * @extends UI/Base:Control
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IBorderStyle
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IValidationStatus
 * @implements Controls/input:IBase
 * @implements Controls/input:ITag
 * @implements Controls/_input/interface/IValueOptions
 * @implements Controls/input:IBorderVisibility
 * @implements Controls/input:IPadding
 * @implements Controls/input:ISelection
 * @public
 * @author Красильников А.С.
 */

class Base<TBaseInputOptions extends IBaseInputOptions = {}> extends Control<TBaseInputOptions> {

    /**
     * @type {Function} Control display template.
     * @protected
     */
    protected _template: TemplateFunction = template;

    /**
     * @type {Controls/_input/Base/Types/DisplayingControl.typedef} Input field in edit mode.
     * @protected
     */
    protected _field: IFieldTemplate = null;

    protected _defaultValue: string|number = null;

    /**
     * @type {Boolean} Determines whether the control stretch over the content.
     * @protected
     */
    protected _autoWidth: boolean = false;

    /**
     * @type {Controls/_input/Base/Types/DisplayingControl.typedef} Input field in read mode.
     * @protected
     */
    protected _readOnlyField: IFieldTemplate = null;

    /**
     * @type {Controls/_input/Base/ViewModel} The display model of the input field.
     * @protected
     */
    protected _viewModel;

    protected _wasActionUser: boolean = true;

    /**
     * @type {Controls/Utils/tmplNotify}
     * @protected
     */
    protected _notifyHandler: Function = EventUtils.tmplNotify;

    /**
     * @type {String} Text of the tooltip shown when the control is hovered over.
     * @protected
     */
    protected _tooltip: string = '';

    /**
     * @type {String} Value of the type attribute in the native field.
     * @remark
     * How an native field works varies considerably depending on the value of its {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types type attribute}.
     * @protected
     */
    protected _type: string = 'text';

    /**
     * Значение атрибута inputmode в нативном поле ввода.
     */
    protected _inputMode: string = 'text';

    /**
     * @type {String} Value of the name attribute in the native field.
     * @protected
     */
    protected _fieldName: string = 'input';

    /**
     * @type {Boolean} Determines whether the control is multiline.
     * @protected
     */
    protected _multiline: boolean = false;

    /**
     * @type {Boolean} Determines whether the control has a rounded border.
     * @protected
     */
    protected _roundBorder: boolean = false;

    /**
     * @type {Controls/_utils/sizeUtils/hasHorizontalScroll}
     * @private
     */
    protected _hasHorizontalScroll: Function = hasHorizontalScroll;

    /**
     * @type {Number|null} The version of IE browser in which the control is build.
     * @private
     */
    protected  _ieVersion: number =  null;

    /**
     * @type {Boolean|null} Determines whether the control is building in the mobile Android environment.
     * @private
     */
    protected  _isMobileAndroid: boolean = null;

    protected  _isIE: boolean = null;

    /**
     * @type {Boolean|null} Determines whether the control is building in the mobile IOS environment.
     * @private
     */
    protected _isMobileIOS: boolean = null;

    protected _hidePlaceholder: boolean = null;
    /**
     * @type {Boolean|null} Determined whether to hide the placeholder using css.
     * @private
     */
    protected _hidePlaceholderUsingCSS: boolean = null;

    /**
     * @type {Boolean|null} Determines whether the control is building in the Edge.
     * @private
     */
    protected _isEdge: boolean = null;

    /**
     * Содержит методы для исправления багов полей ввода связанных с нативным поведением в браузерах.
     */
    protected _fixBugs: string = null;

    protected  _currentVersionModel: number;
    protected _autoComplete: string;
    protected _firstClick: boolean;
    protected _focusByMouseDown: boolean;
    protected _leftFieldWrapper: IFieldTemplate;
    protected _rightFieldWrapper: IFieldTemplate;
    private _isBrowserPlatform: boolean;

    constructor(cfg: IBaseInputOptions) {
        super(cfg);

        this._isIE = detection.isIE;
        this._ieVersion = detection.IEVersion;
        this._isMobileAndroid = detection.isMobileAndroid;
        this._isMobileIOS = detection.isMobileIOS;
        this._isEdge = detection.isIE12;
        this._isBrowserPlatform = constants.isBrowserPlatform;

        /**
         * Hide in chrome because it supports auto-completion of the field when hovering over an item
         * in the list of saved values. During this action no events are triggered and hide placeholder
         * using js is not possible.
         *
         * IMPORTANTLY: Cannot be used in IE. because the native placeholder will be used,
         * and with it the field behaves incorrectly. After the focus out, the input event will be called.
         * When this event is processed, the selection in the field is incorrect.
         * The start and end selection is equal to the length of the native placeholder. https://jsfiddle.net/e0uaczqw/1/
         * When processing input, we set a selection from the model if the value in the field is different
         * from the value in the model. And when you change the selection, the field starts to focus.
         * There is a situation that you can not withdraw focus from the field.
         */
        this._hidePlaceholderUsingCSS = detection.chrome;
    }

    protected _beforeMount(options: IBaseInputOptions): void {
        this._autoComplete = this._compatAutoComplete(options.autoComplete);
        const ctr = this._getViewModelConstructor();
        this._viewModel = new ctr(
            this._getViewModelOptions(options),
            this._getValue(options)
        );
        this._updateSelectionByOptions(options);
        this._initProperties(options);

        if (this._autoComplete !== 'off') {
            /**
             * Browsers use auto-fill to the fields with the previously stored name.
             * Therefore, if all of the fields will be one name, then AutoFill will apply to the first field.
             * To avoid this, we will translate the name of the control to the name of the <input> tag.
             * https://habr.com/company/mailru/blog/301840/
             */
            if ('name' in options) {
                /**
                 * The value of the name option can be undefined.
                 * Should it be so unclear. https://online.sbis.ru/opendoc.html?guid=a32eb034-b2da-4718-903f-9c09949adb2f
                 */
                if (typeof options.name !== 'undefined') {
                    this._fieldName = options.name;
                }
            }
        }
        /**
         * Placeholder is displayed in an empty field. To learn about the emptiness of the field
         * with AutoFill enabled is possible through css or the status value from <input>.
         * The state is not available until the control is mount to DOM. So hide the placeholder until then.
         */
        this._hidePlaceholder = this._autoComplete !== 'off' && !this._hidePlaceholderUsingCSS;
    }

    protected _afterMount(): void {
        this._hidePlaceholder = false;
    }

    protected _beforeUpdate(newOptions: IBaseInputOptions): void {
        const newViewModelOptions = this._getViewModelOptions(newOptions);
        this._viewModel.displayValueBeforeUpdate = this._viewModel.displayValue;
        this._updateViewModel(newViewModelOptions, this._getValue(newOptions));
        this._updateSelectionByOptions(newOptions);
    }

    /**
     * @type {Controls/_input/Render#style}
     * @protected
     */
    protected _renderStyle(): string {
        return '';
    }

    /**
     * Event handler mouse enter.
     * @private
     */
    protected _mouseEnterHandler(event: SyntheticEvent<MouseEvent>): void {
        this._tooltip = this._getTooltip();

        /**
         * TODO: https://online.sbis.ru/open_dialog.html?guid=011f1615-81e1-e01b-11cb-881d311ae617&message=010c1611-8160-e015-213d-5a11b13ef818
         * Remove after execution https://online.sbis.ru/opendoc.html?guid=809254e8-e179-443b-b8b7-f4a37e05f7d8
         */
        this._notify('mouseenter', [event]);
    }

    protected _cutHandler(event: SyntheticEvent<KeyboardEvent>): void {
        // redefinition
    }

    protected _copyHandler(event: SyntheticEvent<ClipboardEvent>): void {
        // redefinition
    }

    protected _keyUpHandler(event: SyntheticEvent<KeyboardEvent>): void {
        // redefinition
    }

    protected _keyDownHandler(event: SyntheticEvent<KeyboardEvent>): void {
        processKeydownEvent(event);
    }

    protected _selectHandler(): void {
        // redefinition
    }

    protected _focusOutHandler(): void {
        // redefinition
    }

    protected _touchStartHandler(): void {
        // redefinition
    }

    /**
     * Event handler click in native field.
     * @private
     */
    protected _clickHandler(event: SyntheticEvent<MouseEvent>): void {
        this._firstClick = false;
    }

    protected _inputHandler(event: SyntheticEvent<KeyboardEvent>): void {
        // redefinition
    }

    protected _placeholderClickHandler(): void {
        /**
         * Placeholder is positioned above the input field.
         * When clicking, the cursor should stand in the input field.
         * To do this, we ignore placeholder using the pointer-events property with none value.
         * The property is not supported in ie lower version 11.
         * In ie 11, you sometimes need to switch versions in emulation to work.
         * Therefore, we ourselves will activate the field on click.
         * https://caniuse.com/#search=pointer-events
         */
        if (this._ieVersion && this._ieVersion < 12) {
            this._getField().focus();
        }
    }

    protected _focusInHandler(event: SyntheticEvent<FocusEvent>): void {
        if (this._options.selectOnClick) {
            this._viewModel.select();
        }

        if (this._focusByMouseDown) {
            this._firstClick = true;
            this._focusByMouseDown = false;
        }
    }

    protected _mouseDownHandler(): void {
        if (!this._isFieldFocused()) {
            this._focusByMouseDown = true;
        }
    }

    protected _domAutoCompleteHandler(): void {
        /**
         * When the user selects a value from the auto-complete, the other fields associated with it are
         * automatically filled in. The logic of the control operation is based on displaying the value
         * according to its options. Therefore, the field value is updated during the synchronization cycle.
         *
         * In firefox, after the field is automatically filled in, you should immediately set the value
         * in the field without waiting for a synchronization cycle. Otherwise, the values will not be substituted
         * into other fields.
         *
         * About what happened auto-complete learn through the event DOMAutoComplete,
         * which is supported only in firefox. https://developer.mozilla.org/en-US/docs/Web/Events/DOMAutoComplete
         */

        this._calculateValueForTemplate();
    }

    /**
     *
     * @return {HTMLElement}
     * @private
     */
    private _getActiveElement(): Element {
        return document.activeElement;
    }

    private _updateSelection(selection): void {
        this._getField().setSelectionRange(selection.start, selection.end);
    }

    /**
     * @type {Controls/Utils/getTextWidth}
     * @private
     */
    private _getTextWidth(value: string): number {
        const element: HTMLElement = this._children.forCalc;

        /**
         * The element for calculations is available only at the moment of field focusing.
         * The reason is that the main call occurs during input when the field is in focus.
         * At other times, the element will be used very rarely. So for the rare cases
         * it is better to create it yourself.
         */
        return element ? this._getTextWidthByDOM(element, value) : this._getTextWidthThroughCreationElement(value);
    }

    /**
     * @param {Object} options Control options.
     * @protected
     */
    protected _initProperties(options: IBaseInputOptions): void {
        /**
         * Init the name of the control and to pass it to the templates.
         * Depending on it, classes will be generated. An example of class is controls-{{controlsName}}...
         * With the override in the heirs, you can change the display of the control. To do this,
         * define styles for the class generated in the template.
         * This approach avoids creating new templates with static classes if the current one is not suitable.
         */
        const CONTROL_NAME: string = 'InputBase';

        this._field = {
            template: fieldTemplate,
            scope: {
                controlName: CONTROL_NAME,
                autoComplete: this._autoComplete,
                inputMode: this._inputMode,
                inputCallback: options.inputCallback,
                calculateValueForTemplate: this._calculateValueForTemplate.bind(this),
                recalculateLocationVisibleArea: this._recalculateLocationVisibleArea.bind(this),
                isFieldFocused: this._isFieldFocused.bind(this)
            }
        };
        this._readOnlyField = {
            template: readOnlyFieldTemplate,
            scope: {
                controlName: CONTROL_NAME
            }
        };
        this._leftFieldWrapper = {
            template: options.leftFieldTemplate,
            scope: {}
        };
        this._rightFieldWrapper = {
            template: options.rightFieldTemplate,
            scope: {}
        };

        /**
         * TODO: Remove after execution:
         * https://online.sbis.ru/opendoc.html?guid=6c755b9b-bbb8-4a7d-9b50-406ef7f087c3
         */
        let emptySymbol = unEscapeASCII('&#65279;');
        this._field.scope.emptySymbol = emptySymbol;
        this._readOnlyField.scope.emptySymbol = emptySymbol;
    }

    protected _notifyValueChanged(): void {
        this._notify('valueChanged', [this._viewModel.value, this._viewModel.displayValue]);
    }

    protected _notifyInputCompleted(): void {
        this._notify('inputCompleted', [this._viewModel.value, this._viewModel.displayValue]);
    }

    /**
     * Get the native field.
     * @return {Node}
     * @private
     */
    protected _getField(): Field<String, IViewModelOptions> {
        return this._children[this._fieldName] as Field<String, IViewModelOptions>;
    }

    protected _getReadOnlyField(): HTMLElement {
        return this._children.readOnlyField;
    }

    /**
     * Get the options for the view model.
     * @return {Object} View model options.
     * @private
     */
    protected _getViewModelOptions(options: IBaseInputOptions): unknown {
        return {};
    }

    /**
     * Get the constructor for the view model.
     * @return {Controls/_input/Base/ViewModel} View model constructor.
     * @private
     */
    protected _getViewModelConstructor(): ViewModel {
        return ViewModel;
    }

    /**
     * Get the tooltip for field.
     * If the displayed value fits in the field, the tooltip option is returned.
     * Otherwise the displayed value is returned.
     * @return {String} Tooltip.
     * @private
     */
    _getTooltip(): string {
        let hasFieldHorizontalScroll: boolean = false;
        const field = this._getField();
        const readOnlyField: HTMLElement = this._getReadOnlyField();

        if (field) {
            hasFieldHorizontalScroll = field.hasHorizontalScroll();
        } else if (readOnlyField) {
            hasFieldHorizontalScroll = this._hasHorizontalScroll(readOnlyField);
        }

        return hasFieldHorizontalScroll ? this._viewModel.displayValue : this._options.tooltip;
    }

    private _calculateValueForTemplate(): string {
        return this._viewModel.displayValue;
    }

    /**
     * Изменение расположения видимой области поля так, чтобы отобразился курсор.
     * Если курсор виден, расположение не изменяется. В противном случае новое местоположение будет таким, что курсор отобразится в середине области.
     */
    private _recalculateLocationVisibleArea(field: HTMLInputElement, displayValue: string, selection): void {
        if (displayValue.length === selection.end) {
            /**
             * When the carriage is at the end, you need to set the maximum possible value of scrollLeft.
             *
             * Theoretically, the value is defined as the difference between scrollWidth and clientWidth.
             * In different browsers, this value is different. Because scrollWidth and clientWidth can be different,
             * or fractional and rounded in different directions. Therefore, this method can not be used.
             *
             * If you set a value higher than the maximum, the browser will automatically set the maximum.
             * The scrollWidth property is always greater than the maximum scrollLeft, so set it.
             */
            field.scrollLeft = field.scrollWidth;

            return;
        }

        const textWidthBeforeCursor = this._getTextWidth(displayValue.substring(0, selection.end));

        const positionCursor = textWidthBeforeCursor + WIDTH_CURSOR;
        const sizeVisibleArea = field.clientWidth;
        const beginningVisibleArea = field.scrollLeft;
        const endingVisibleArea = field.scrollLeft + sizeVisibleArea;

        /**
         * The cursor is visible if its position is between the beginning and the end of the visible area.
         */
        const hasVisibilityCursor = beginningVisibleArea < positionCursor && positionCursor < endingVisibleArea;

        if (!hasVisibilityCursor) {
            field.scrollLeft = positionCursor - sizeVisibleArea / 2;
        }
    }

    _isFieldFocused(): boolean {
        /**
         * A field in focus when it is the active element on the page.
         * The active element is only on the client. The field cannot be focused on the server.
         */
        if (this._isBrowserPlatform) {
            return this._getActiveElement() === this._getField();
        }

        return false;
    }

    private _getTextWidthByDOM(element: HTMLElement, value: string): number {
        element.innerHTML = value;
        const width = element.scrollWidth;
        element.innerHTML = '';

        return width;
    }

    private _getTextWidthThroughCreationElement(value: string): number {
        const element = document.createElement('div');
        element.classList.add('controls-InputBase__forCalc');
        element.innerHTML = value;

        document.body.appendChild(element);
        const width = element.scrollWidth;
        document.body.removeChild(element);

        return width;
    }

    private _compatAutoComplete(autoComplete: boolean|string): string {
        if (typeof autoComplete === 'boolean') {
            return autoComplete ? 'on' : 'off';
        }

        return autoComplete;
    }

    private _updateViewModel(newOptions: IBaseInputOptions, newValue: string): void {
        if (!isEqual(this._viewModel.options, newOptions)) {
            this._viewModel.options = newOptions;
        }

        if (this._viewModel.value !== newValue) {
            this._viewModel.value = newValue;
        }

        this._updateSelectionByOptions(newOptions);
    }

    private _getValue(options: IBaseInputOptions): string {
        if (options.hasOwnProperty('value')) {
            return options.value === undefined ? this._defaultValue : options.value;
        }

        if (this._viewModel) {
            return this._viewModel.value;
        }

        return this._defaultValue as string;
    }

    private _updateSelectionByOptions(options: IBaseInputOptions): void {
        if (
            options.hasOwnProperty('selectionStart') &&
            options.hasOwnProperty('selectionEnd') &&
            (this._options.selectionStart !== options.selectionStart ||
                this._options.selectionEnd !== options.selectionEnd)
        ) {
            this._viewModel.selection = {
                start: options.selectionStart,
                end: options.selectionEnd
            };
        }
    }

    paste(text: string): void {
        this._getField().paste(text);
    }

    static _theme: string[] = ['Controls/input'];

    static getDefaultOptions(): object {
        return {
            ...getDefaultPaddingOptions(),
            tooltip: '',
            inlineHeight: 'default',
            placeholder: '',
            textAlign: 'left',
            autoComplete: 'off',
            fontSize: 'm',
            fontColorStyle: 'default',
            spellCheck: true,
            selectOnClick: false
        };
    }

    static getOptionTypes(): object {
        return {
            ...getOptionPaddingTypes(),
            value: descriptor(String, null),
            selectionStart: descriptor(Number),
            selectionEnd: descriptor(Number),
            tooltip: descriptor(String),
            /*autoComplete: descriptor(String).oneOf([
             'on',
             'off',
             'username',
             'current-password'
             ]),*/
            spellCheck: descriptor(Boolean),
            selectOnClick: descriptor(Boolean),
            inputCallback: descriptor(Function),

            /**
             * Setting placeholder as HTML in wml, template engine converts it to an array.
             */
            /**
             * https://online.sbis.ru/opendoc.html?guid=af7e16d7-139f-4414-b7af-9e3a1a0dae05
             * placeholder: descriptor(String, Function, Array),
             */
            textAlign: descriptor(String).oneOf([
                'left',
                'right',
                'center'
            ]),
            tagStyle: descriptor(String).oneOf([
                'info',
                'danger',
                'primary',
                'success',
                'warning',
                'secondary'
            ])
        };
    }
}

export default Base;
