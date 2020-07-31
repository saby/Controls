import Control = require('Core/Control');
import Env = require('Env/Env');
import entity = require('Types/entity');
import tmplNotify = require('Controls/Utils/tmplNotify');
import {isEqual} from 'Types/object';
import ViewModel = require('Controls/_input/Base/ViewModel');
import {delay as runDelayed} from 'Types/function';
import unEscapeASCII = require('Core/helpers/String/unEscapeASCII');
import hasHorizontalScroll = require('Controls/Utils/hasHorizontalScroll');
import template = require('wml!Controls/_input/Base/Base');
import fieldTemplate = require('wml!Controls/_input/Base/Field');
import readOnlyFieldTemplate = require('wml!Controls/_input/Base/ReadOnly');

import {
    split,
    getInputType,
    getAdaptiveInputType,
    IInputType
} from 'Controls/_input/Base/InputUtil';
import {ISplitValue} from './resources/Types';
import MobileFocusController from 'Controls/_input/Base/MobileFocusController';
import {FixBugs} from './FixBugs';
import {getOptionPaddingTypes, getDefaultPaddingOptions} from './interface/IPadding';

import 'wml!Controls/_input/Base/Stretcher';
import 'wml!Controls/_input/Base/FixValueAttr';

interface IFieldTemplate {
    template: 'wml!Controls/_input/Base/Field';
    scope: {
        emptySymbol: string;
        controlName: string;
        autoComplete: boolean;
        ieVersion: number | null;
        isFieldFocused: () => boolean;

        value?: string;
        options?: any;
        autoWidth?: boolean;
    };
}

var _private = {

    /**
     * @type {Number} The width of the cursor in the field measured in pixels.
     * @private
     */
    WIDTH_CURSOR: 1,

    HYPHEN: '–',

    DASH: '—',

    /**
     * @param {Controls/_input/Base} self Control instance.
     * @param {Object} Ctr View model constructor.
     * @param {Object} options View model options.
     * @param {String} value View model value.
     */
    initViewModel: function (self, Ctr, options, value) {
        self._viewModel = new Ctr(options, value);
    },

    /**
     * @param {Controls/_input/Base} self Control instance.
     */
    initField: function (self) {
        /**
         * When you mount a field in the DOM, the browser can auto fill the field.
         * Then the displayed value in the model will not match the value in the field.
         * In this case, you change the displayed value in the model to the value in the field and
         * must notify the parent that the value in the field has changed.
         */
        _private.forField(self, function (field) {
            if (_private.hasAutoFillField(field, self._viewModel)) {
                self._viewModel.displayValue = field.value;
                _private.notifyValueChanged(self);
            }
        });
    },

    /**
     * @param {Controls/_input/Base} self Control instance.
     * @param {Object} newOptions New view model options.
     * @param {String} newValue New view model value.
     */
    updateViewModel: function (self, newOptions, newValue) {
        if (!isEqual(self._viewModel.options, newOptions)) {
            self._viewModel.options = newOptions;
        }

        if (self._viewModel.value !== newValue) {
            self._viewModel.value = newValue;
        }
    },

    /**
     * @param {Controls/_input/Base} self Control instance.
     * @param {String} value The value to be set in the field.
     * @param {Controls/_input/Base/Types/Selection.typedef} selection The selection to be set in the field.
     */
    updateField: function (self, value: string, selection) {
        _private.updateValue(self, value);
        self._updateSelection(selection);
    },

    updateValue: function (self, value) {
        const field = self._getField();

        if (field.value !== value) {
            field.value = value;
        }
    },

    /**
     * Determines whether the value of the selection in the field with the checked value is equal.
     * @param {Node} field Field to check.
     * @param {Controls/_input/Base/Types/Selection.typedef} selection The checked value.
     * @return {boolean}
     */
    hasSelectionChanged: function (field, selection) {
        return field.selectionStart !== selection.start || field.selectionEnd !== selection.end;
    },

    /**
     * Determinate whether the field has been auto fill.
     * @param {HTMLInputElement} field
     * @param {String} modelValue
     * @return {Boolean}
     */
    hasAutoFillField: function (field: HTMLInputElement, model: ViewModel) {
        const fieldValue: string = field.value;
        const modelValue: string = model.displayValue;

        return fieldValue !== '' && fieldValue !== modelValue;
    },

    isFieldFocused: function (self) {
        /**
         * A field in focus when it is the active element on the page.
         * The active element is only on the client. The field cannot be focused on the server.
         */
        if (self._isBrowserPlatform) {
            return self._getActiveElement() === self._getField();
        }

        return false;
    },

    isReAutoCompleteInEdge: function (isEdge, model, valueField) {
        /**
         * If you re-auto-complete, the value in the field and in the model will be the same.
         * But this is not enough, because it will be the case if you select the entire field and
         * paste the value from the buffer equal to the current value of the field.
         * Check that there was no selection.
         */
        return isEdge && model.displayValue === valueField && model.selection.start === model.selection.end;
    },

    callChangeHandler: function (self) {
        if (self._viewModel.displayValue !== self._fixedDisplayValue) {
            self._changeHandler();
            self._fixedDisplayValue = self._viewModel.displayValue;
        }
    },

    /**
     * @param {Controls/_input/Base} self Control instance.
     */
    notifyValueChanged: function (self) {
        self._notify('valueChanged', [self._viewModel.value, self._viewModel.displayValue]);
    },

    /**
     * @param {Controls/_input/Base} self Control instance.
     */
    notifyInputCompleted: function (self) {
        self._notify('inputCompleted', [self._viewModel.value, self._viewModel.displayValue]);
    },

    /**
     * @param {Controls/_input/Base} self Control instance.
     * @param splitValue Parsed value after user input.
     * @param inputType Type of user input.
     */
    handleInput: function (self, splitValue: ISplitValue, inputType) {
        const displayValue: string = self._viewModel.displayValue;

        if (self._viewModel.handleInput(splitValue, inputType)) {
            if (self._options.inputCallback) {
                const formattedText = self._options.inputCallback({
                    value: self._viewModel.value,
                    position: self._viewModel.selection.start,
                    displayValue: self._viewModel.displayValue
                });

                self._viewModel.displayValue = formattedText.displayValue;
                self._viewModel.selection = formattedText.position;
            }

            if (self._viewModel.displayValue !== displayValue) {
                _private.notifyValueChanged(self);
            }
        }
    },

    /**
     * Calculate what type of input was carried out by the user.
     * @param {Controls/_input/Base} self Control instance.
     * @param {String} oldValue The value of the field before user input.
     * @param {String} newValue The value of the field after user input.
     * @param {Number} position The caret position of the field after user input.
     * @param {Controls/_input/Base/Types/Selection.typedef} selection The selection of the field before user input.
     * @param {Controls/_input/Base/Types/NativeInputType.typedef} [nativeInputType]
     * The value of the type property in the handle of the native input event.
     * @return {Controls/_input/Base/Types/InputType.typedef}
     */
    calculateInputType: function (self, oldValue, newValue, position, selection, nativeInputType): IInputType {
        /**
         * On Android if you have enabled spell check and there is a deletion of the last character
         * then the type of event equal insertCompositionText.
         * However, in this case, the event type must be deleteContentBackward.
         * Therefore, we will calculate the event type.
         */
        if (self._isMobileAndroid && nativeInputType === 'insertCompositionText') {
            return getInputType(oldValue, newValue, position, selection);
        }

        return nativeInputType
            ? getAdaptiveInputType(nativeInputType, selection)
            : getInputType(oldValue, newValue, position, selection);
    },

    /**
     * @param {String} pastedText
     * @param {String} displayedText
     * @param {Controls/_input/Base/Types/Selection.typedef} selection
     * @return {Controls/_input/Base/Types/SplitValue.typedef}
     */
    calculateSplitValueToPaste: function (pastedText, displayedText, selection): ISplitValue {
        return {
            before: displayedText.substring(0, selection.start),
            insert: pastedText,
            delete: displayedText.substring(selection.start, selection.end),
            after: displayedText.substring(selection.end)
        };
    },

    /**
     * Change the location of the visible area of the field so that the cursor is visible.
     * If the cursor is visible, the location is not changed. Otherwise, the new location will be such that
     * the cursor is visible in the middle of the area.
     * @param {Controls/_input/Base} self Control instance.
     * @param {Node} field
     * @param {String} value
     * @param {Controls/_input/Base/Types/Selection.typedef} selection
     */
    recalculateLocationVisibleArea: function (self, field, value, selection) {
        var textWidthBeforeCursor = self._getTextWidth(value.substring(0, selection.end));

        var positionCursor = textWidthBeforeCursor + _private.WIDTH_CURSOR;
        var sizeVisibleArea = field.clientWidth;
        var beginningVisibleArea = field.scrollLeft;
        var endingVisibleArea = field.scrollLeft + sizeVisibleArea;

        /**
         * The cursor is visible if its position is between the beginning and the end of the visible area.
         */
        var hasVisibilityCursor = beginningVisibleArea < positionCursor && positionCursor < endingVisibleArea;

        if (!hasVisibilityCursor) {
            field.scrollLeft = positionCursor - sizeVisibleArea / 2;
        }
    },

    /**
     * Get the beginning and end of the selected portion of the field's text.
     * @param {Controls/_input/Base} self Control instance.
     * @return {Controls/_input/Base/Types/Selection.typedef}
     * @private
     */
    getFieldSelection: function (self) {
        var field = self._getField();

        return {
            start: field.selectionStart,
            end: field.selectionEnd
        };
    },

    /**
     * The method executes a provided function once for field.
     * @param {Controls/_input/Base} self Control instance.
     * @param {Controls/_input/Base/Types/CallbackForField.typedef} callback Function to execute for field.
     * @private
     */
    forField: function (self, callback) {
        /**
         * In read mode, the field does not exist.
         */
        if (!self._options.readOnly) {
            callback(self._getField());
        }
    },

    getTextWidth: function (element, value) {
        element.innerHTML = value;
        var width = element.scrollWidth;
        element.innerHTML = '';

        return width;
    },

    getTextWidthThroughCreationElement: function (value) {
        var element = document.createElement('div');
        element.classList.add('controls-InputBase__forCalc');
        element.innerHTML = value;

        document.body.appendChild(element);
        var width = element.scrollWidth;
        document.body.removeChild(element);

        return width;
    },

    saveSelection: function (self) {
        const model = self._viewModel;
        /**
         * Input processing occurs on the input event. At the time of processing,
         * the data in the field has already changed. To work properly,
         * we need to know the selection before the changes. To do this, save it in the model.
         */
        model.selection = self._getFieldSelection();

        _private.updateField(self, model.displayValue, model.selection);
    },

    compatAutoComplete: function (autoComplete) {
        if (typeof autoComplete === 'boolean') {
            return autoComplete ? 'on' : 'off';
        }

        return autoComplete;
    },

    getValue: function (self, options) {
        if (options.hasOwnProperty('value')) {
            return options.value === undefined ? self._defaultValue : options.value;
        }

        if (self._viewModel) {
            return self._viewModel.value;
        }

        return self._defaultValue;
    }
};

/**
 * Базовый класс для текстовых полей ввода.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Base
 * @extends UI/Base:Control
 *
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IBorderStyle
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IValidationStatus
 * @implements Controls/input:IBase
 * @implements Controls/input:ITag
 * @implements Controls/input:IValue
 * @implements Controls/input:IBorderVisibility
 * @implements Controls/input:IPadding
 *
 * @public
 *
 * @author Красильников А.С.
 */

var Base = Control.extend({

    /**
     * @type {Function} Control display template.
     * @protected
     */
    _template: template,

    /**
     * @type {Controls/_input/Base/Types/DisplayingControl.typedef} Input field in edit mode.
     * @protected
     */
    _field: null,

    _defaultValue: null,

    /**
     * @type {Boolean} Determines whether the control stretch over the content.
     * @protected
     */
    _autoWidth: false,

    /**
     * @type {Controls/_input/Base/Types/DisplayingControl.typedef} Input field in read mode.
     * @protected
     */
    _readOnlyField: null,

    /**
     * @type {Controls/_input/Base/ViewModel} The display model of the input field.
     * @protected
     */
    _viewModel: null,

    _wasActionUser: true,

    /**
     * @type {Controls/Utils/tmplNotify}
     * @protected
     */
    _notifyHandler: tmplNotify,

    /**
     * @type {String} Text of the tooltip shown when the control is hovered over.
     * @protected
     */
    _tooltip: '',

    /**
     * @type {String} Value of the type attribute in the native field.
     * @remark
     * How an native field works varies considerably depending on the value of its {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types type attribute}.
     * @protected
     */
    _type: 'text',

    /**
     * Значение атрибута inputmode в нативном поле ввода.
     */
    _inputMode: 'text',

    /**
     * @type {String} Value of the name attribute in the native field.
     * @protected
     */
    _fieldName: 'input',

    /**
     * @type {Boolean} Determines whether the control is multiline.
     * @protected
     */
    _multiline: false,

    /**
     * @type {Boolean} Determines whether the control has a rounded border.
     * @protected
     */
    _roundBorder: false,

    /**
     * @type {Number} The number of skipped save the current field selection to the model.
     * @private
     */
    _numberSkippedSaveSelection: 0,

    /**
     * Зафиксированное отображаемое значение.
     * @remark
     * Значение фиксируется после события inputCompleted. Или после изменения отображаемого значения, в результате изменения родителем опции value.
     * Требуется для определения вызова события inputCompleted. Одним из условий является, что текущее значение отличается от зафиксированного.
     * @type {String}
     * @private
     */
    _fixedDisplayValue: null,

    _updateSelection: function (selection) {
        const field: HTMLInputElement = this._getField();

        /**
         * In IE, change the selection leads to the automatic focusing of the field.
         * Therefore, we change it only if the field is already focused.
         */
        if (_private.hasSelectionChanged(field, selection) && _private.isFieldFocused(this)) {
            /**
             * After calling setSelectionRange the select event is triggered and saved the selection in model.
             * Bug detected in all browsers except IE. Can check with the demo https://jsfiddle.net/xcnmbg9e/
             * Do not need to do this because the model is now the actual selection.
             */
            if (!this._isIE) {
                this._numberSkippedSaveSelection++;
            }
            field.setSelectionRange(selection.start, selection.end);
            return true;
        }
        return false;
    },

    /**
     * @type {Controls/Utils/getTextWidth}
     * @private
     */
    _getTextWidth: function (value) {
        var element = this._children.forCalc;

        /**
         * The element for calculations is available only at the moment of field focusing.
         * The reason is that the main call occurs during input when the field is in focus.
         * At other times, the element will be used very rarely. So for the rare cases
         * it is better to create it yourself.
         */
        return element ? _private.getTextWidth(element, value) : _private.getTextWidthThroughCreationElement(value);
    },

    /**
     * @type {Controls/Utils/hasHorizontalScroll}
     * @private
     */
    _hasHorizontalScroll: hasHorizontalScroll,

    /**
     * @type {Number|null} The version of IE browser in which the control is build.
     * @private
     */
    _ieVersion: null,

    /**
     * @type {Boolean|null} Determines whether the control is building in the mobile Android environment.
     * @private
     */
    _isMobileAndroid: null,

    /**
     * @type {Boolean|null} Determines whether the control is building in the mobile IOS environment.
     * @private
     */
    _isMobileIOS: null,

    _hidePlaceholder: null,
    /**
     * @type {Boolean|null} Determined whether to hide the placeholder using css.
     * @private
     */
    _hidePlaceholderUsingCSS: null,

    /**
     * @type {Boolean|null} Determines whether the control is building in the Edge.
     * @private
     */
    _isEdge: null,

    /**
     * Содержит методы для исправления багов полей ввода связанных с нативным поведением в браузерах.
     */
    _fixBugs: null,

    /**
     * @type {Controls/_input/Render#style}
     * @protected
     */
    _renderStyle() {
        return '';
    },

    splitValue: null,

    /**
     *
     * @return {HTMLElement}
     * @private
     */
    _getActiveElement: function () {
        return document.activeElement;
    },

    constructor: function (cfg) {
        Base.superclass.constructor.call(this, cfg);

        this._isIE = Env.detection.isIE;
        this._ieVersion = Env.detection.IEVersion;
        this._isMobileAndroid = Env.detection.isMobileAndroid;
        this._isMobileIOS = Env.detection.isMobileIOS;
        this._isEdge = Env.detection.isIE12;
        this._isBrowserPlatform = Env.constants.isBrowserPlatform;

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
        this._hidePlaceholderUsingCSS = Env.detection.chrome;
    },

    _beforeMount: function (options) {
        this._autoComplete = _private.compatAutoComplete(options.autoComplete);

        const viewModelCtr = this._getViewModelConstructor();
        const viewModelOptions = this._getViewModelOptions(options);

        this._initProperties(options);
        _private.initViewModel(this, viewModelCtr, viewModelOptions, _private.getValue(this, options));

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

        this._fixBugs = new FixBugs({
            updatePositionCallback: () => {
                return this._updateSelection(this._viewModel.selection);
            }
        }, this);
        this._fixedDisplayValue = this._viewModel.displayValue;
        /**
         * Placeholder is displayed in an empty field. To learn about the emptiness of the field
         * with AutoFill enabled is possible through css or the status value from <input>.
         * The state is not available until the control is mount to DOM. So hide the placeholder until then.
         */
        this._hidePlaceholder = this._autoComplete !== 'off' && !this._hidePlaceholderUsingCSS;
        this._fixBugs.beforeMount();
    },

    _afterMount: function () {
        _private.initField(this);

        this._hidePlaceholder = false;
        this._fixBugs.afterMount();
    },

    _beforeUpdate: function (newOptions) {
        const newViewModelOptions = this._getViewModelOptions(newOptions);
        const oldDisplayValue = this._viewModel.displayValue;

        _private.updateViewModel(this, newViewModelOptions, _private.getValue(this, newOptions));

        if (this._options.readOnly === true && newOptions.readOnly === false) {
            // oldDisplayValue запоминается при клике на поле ввода. Если контрол был задизаблен и прикладной разработчик по
            // клику на поле ввода меняет опцию readonly с true на false, то обработчик на клик не вызовется, т.к. в режиме
            // readOnly поле ввода не отображается. Подробнее:
            // TODO: https://online.sbis.ru/opendoc.html?guid=ba1ec63e-1915-499d-9e05-babfa3b79b41
            this._viewModel._oldDisplayValue = oldDisplayValue;
        }

        const displayValueChangedByParent: boolean = oldDisplayValue !== this._viewModel.displayValue;
        if (displayValueChangedByParent) {
            this._fixedDisplayValue = this._viewModel.displayValue;
        }

        this._fixBugs.beforeUpdate(this._options, newOptions);
    },

    _afterUpdate: function() {
        this._fixBugs.afterUpdate();
    },

    /**
     * @param {Object} options Control options.
     * @protected
     */
    _initProperties: function (options) {
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
                calculateValueForTemplate: this._calculateValueForTemplate.bind(this),
                isFieldFocused: _private.isFieldFocused.bind(_private, this)
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
        var emptySymbol = unEscapeASCII('&#65279;');
        this._field.scope.emptySymbol = emptySymbol;
        this._readOnlyField.scope.emptySymbol = emptySymbol;
    },

    /**
     * Event handler mouse enter.
     * @private
     */
    _mouseEnterHandler: function (event) {
        this._tooltip = this._getTooltip();

        /**
         * TODO: https://online.sbis.ru/open_dialog.html?guid=011f1615-81e1-e01b-11cb-881d311ae617&message=010c1611-8160-e015-213d-5a11b13ef818
         * Remove after execution https://online.sbis.ru/opendoc.html?guid=809254e8-e179-443b-b8b7-f4a37e05f7d8
         */
        this._notify('mouseenter', [event]);
    },

    _keyDownHandler: function (event) {
        const processedKeys: number[] = [
            Env.constants.key.end,
            Env.constants.key.home,
            Env.constants.key.left,
            Env.constants.key.right,
            Env.constants.key.space
        ];

        /**
         * The keys processed by the input field should not handle the controls above.
         * To do this, stop the bubbling of the event.
         */
        /**
         * Клавиши обрабатываемые полем ввода не должны обрабатывать контролы выше.
         * Для этого останавливаем всплытие события.
         */
        if (processedKeys.includes(event.nativeEvent.keyCode)) {
            event.stopPropagation();
        }

        const keyCode = event.nativeEvent.keyCode;
        if (keyCode === Env.constants.key.enter && this._isTriggeredChangeEventByEnterKey()) {
            _private.callChangeHandler(this);
        }
    },
    _cutHandler: function() {
        // redefinition
    },
    _copyHandler: function() {
        // redefinition
    },
    /**
     * Event handler key up in native field.
     * @param {Object} event Event descriptor.
     * @private
     */
    _keyUpHandler: function (event) {
        const keyCode = event.nativeEvent.keyCode;

        /**
         * Clicking the arrows and keys home, end moves the cursor.
         */
        if (keyCode >= Env.constants.key.end && keyCode <= Env.constants.key.down) {
            _private.saveSelection(this);
        }
    },

    /**
     * Event handler click in native field.
     * @private
     */
    _clickHandler: function () {
        var self = this;

        /**
         * If the value in the field is selected, when you click on the selected area,
         * the cursor in the field is placed after the event. https://jsfiddle.net/wv9o4xmd/
         * Therefore, we remember the selection from the field at the next drawing cycle.
         */
        runDelayed(function () {
            self._viewModel.selection = self._getFieldSelection();
        });
        this._firstClick = false;
    },

    /**
     * Event handler select in native field.
     * @private
     */
    _selectHandler: function () {
        if (this._numberSkippedSaveSelection > 0) {
            this._numberSkippedSaveSelection--;
        } else {
            _private.saveSelection(this);
        }
    },

    _inputHandler: function (event) {
        const field = this._getField();
        const model = this._viewModel;
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

        const inputType: IInputType = _private.calculateInputType(
            this, value, newValue, position,
            selection, event.nativeEvent.inputType
        );
        this.splitValue = split(value, newValue, position, selection, inputType);

        _private.handleInput(this, this.splitValue, inputType);

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
        if (!this._isMobileAndroid) {
            _private.updateField(this, model.displayValue, model.selection);
        }
    },

    /**
     * Handler for the change event.
     * @remark
     * The handler cannot be called through a subscription to the change event in the control template.
     * The reason is that the native event does not work in all browsers.
     * Therefore you need to call it on focus in or press enter.
     * Bug in firefox: If the value in the field after the input event is not changed,
     * but changed after a timeout, then the browser considers that it has not changed and event is not triggered.
     * https://jsfiddle.net/v6g0fz7u/
     * @protected
     */
    _changeHandler: function () {
        _private.notifyInputCompleted(this);
    },

    _placeholderClickHandler: function () {
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
    },

    _mouseDownOnContainerHandler: function(event: MouseEvent): void {
        /**
         * Нативное поле ввода позиционируется относительно контейнера с отступами. Клик в область отступов
         * не будет приводить к фокусировке поля. Зовем фокусировку вручную.
         */
        const readOnlyField: boolean = this._options.readOnly || this._field.scope.readOnly;
        const clickByField: boolean = event.target === this._getField();

        if (!readOnlyField && !clickByField) {
            this.activate({enableScreenKeyboard: true, enableScrollToElement: true});
        }
    },

    _focusInHandler: function (event) {
        if (this._options.selectOnClick) {
            this._viewModel.select();
        }

        if (this._focusByMouseDown) {
            this._firstClick = true;
            this._focusByMouseDown = false;
        }

        this._fixBugs.focusHandler(event);
        MobileFocusController.focusHandler(event);
    },

    /**
     * Event handler focus out in native field.
     * @protected
     */
    _focusOutHandler: function (event) {
        /**
         * TODO: KINGO
         * Когда меняется режим редактирования на чтения происходит перерисовка. Поле удаляется и
         * фокус уходит. Поэтому в обработчике потери фокуса поля не будет, и все действия с ним не могут быть совершены.
         * Обрабатываем такую ситуация проверкой на существование поля.
         */
        if (this._getField()) {
            /**
             * After the focus disappears, the field should be scrolled to the beginning.
             * Each browser works differently. For example, chrome scrolled to the beginning.
             * IE, Firefox does not scrolled. So we do it ourselves.
             */
            this._getField().scrollLeft = 0;
        }

        MobileFocusController.blurHandler(event);
        _private.callChangeHandler(this);
    },

    _touchStartHandler: function (event) {
        MobileFocusController.touchStartHandler(event);
    },

    _mouseDownHandler: function () {
        this._fixBugs.mouseDownHandler();

        if (!_private.isFieldFocused(this)) {
            this._focusByMouseDown = true;
        }
    },

    _domAutoCompleteHandler: function () {
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
    },

    _notifyValueChanged: function () {
        _private.notifyValueChanged(this);
    },

    _notifyInputCompleted: function () {
        _private.notifyInputCompleted(this);
    },

    /**
     * Get the native field.
     * @return {Node}
     * @private
     */
    _getField: function () {
        return this._children[this._fieldName];
    },

    _getReadOnlyField: function () {
        return this._children.readOnlyField;
    },

    /**
     * Get the beginning and end of the selected portion of the field's text.
     * @return {Controls/_input/Base/Types/Selection.typedef}
     * @private
     */
    _getFieldSelection: function () {
        var field = this._getField();

        return {
            start: field.selectionStart,
            end: field.selectionEnd
        };
    },

    /**
     * Get the options for the view model.
     * @return {Object} View model options.
     * @private
     */
    _getViewModelOptions: function () {
        return {};
    },

    /**
     * Get the constructor for the view model.
     * @return {Controls/_input/Base/ViewModel} View model constructor.
     * @private
     */
    _getViewModelConstructor: function () {
        return ViewModel;
    },

    /**
     * Get the tooltip for field.
     * If the displayed value fits in the field, the tooltip option is returned.
     * Otherwise the displayed value is returned.
     * @return {String} Tooltip.
     * @private
     */
    _getTooltip: function () {
        const valueDisplayElement: HTMLElement = this._getField() || this._getReadOnlyField();
        const hasFieldHorizontalScroll: boolean = this._hasHorizontalScroll(valueDisplayElement);

        return hasFieldHorizontalScroll ? this._viewModel.displayValue : this._options.tooltip;
    },

    _calculateValueForTemplate: function () {
        const model = this._viewModel;
        const field = this._getField();

        if (field) {
            const shouldBeChanged =
                field.value !== model.displayValue ||
                _private.hasSelectionChanged(field, model.selection);
            if (shouldBeChanged) {
                this._updateFieldInTemplate();

                if (_private.isFieldFocused(this) && !field.readOnly) {
                    this._recalculateLocationVisibleArea(field, model.displayValue, model.selection);
                }
            }
        }

        return this._fixBugs.getFieldValue();
    },

    _updateFieldInTemplate: function() {
        const model = this._viewModel;
        _private.updateField(this, model.displayValue, model.selection);
    },

    _recalculateLocationVisibleArea: function (field, displayValue, selection) {
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

        _private.recalculateLocationVisibleArea(this, field, displayValue, selection);
    },

    _isTriggeredChangeEventByEnterKey: function () {
        return true;
    },

    paste: function (text) {
        var model = this._viewModel;
        var splitValue = _private.calculateSplitValueToPaste(text, model.displayValue, model.selection);

        _private.handleInput(this, splitValue, 'insert');
    }
});

Base._theme = ['Controls/input'];

Base._private = _private;

Base.getDefaultOptions = function () {
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
};

Base.getOptionTypes = function () {
    return {
        ...getOptionPaddingTypes(),
        value: entity.descriptor(String, null),
        tooltip: entity.descriptor(String),
        /*autoComplete: entity.descriptor(String).oneOf([
         'on',
         'off',
         'username',
         'current-password'
         ]),*/
        spellCheck: entity.descriptor(Boolean),
        selectOnClick: entity.descriptor(Boolean),
        inputCallback: entity.descriptor(Function),

        /**
         * Setting placeholder as HTML in wml, template engine converts it to an array.
         */
        /**
         * https://online.sbis.ru/opendoc.html?guid=af7e16d7-139f-4414-b7af-9e3a1a0dae05
         * placeholder: entity.descriptor(String, Function, Array),
         */
        textAlign: entity.descriptor(String).oneOf([
            'left',
            'right'
        ]),
        tagStyle: entity.descriptor(String).oneOf([
            'info',
            'danger',
            'primary',
            'success',
            'warning',
            'secondary'
        ])
    };
};

export = Base;

