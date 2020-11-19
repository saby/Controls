import Control = require('Core/Control');
import Env = require('Env/Env');
import entity = require('Types/entity');
import {tmplNotify} from 'Controls/eventUtils';
import ViewModel = require('Controls/_input/Base/ViewModel');
import unEscapeASCII = require('Core/helpers/String/unEscapeASCII');
import {hasHorizontalScroll} from 'Controls/scroll';
import template = require('wml!Controls/_input/Base/Base');
import fieldTemplate = require('wml!Controls/_input/Base/Field');
import {processKeydownEvent} from 'Controls/_input/resources/Util';
import readOnlyFieldTemplate = require('wml!Controls/_input/Base/ReadOnly');
import {isEqual} from 'Types/object';

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



    /**
     * Determines whether the value of the selection in the field with the checked value is equal.
     * @param {Node} field Field to check.
     * @param {Controls/_input/Base/Types/Selection.typedef} selection The checked value.
     * @return {boolean}
     */
    hasSelectionChanged: function (field, selection) {
        return field.selectionStart !== selection.start || field.selectionEnd !== selection.end;
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

    /**
     * @param {Controls/_input/Base} self Control instance.
     */
    notifyValueChanged: function (self) {
        self._notify('valueChanged', [self._viewModel.value, self._viewModel.displayValue]);
    },

    notifyInputControl: function (self) {
        self._notify('inputControl', [self._viewModel.value, self._viewModel.displayValue, self._viewModel.selection]);
    },

    /**
     * @param {Controls/_input/Base} self Control instance.
     */
    notifyInputCompleted: function (self) {
        self._notify('inputCompleted', [self._viewModel.value, self._viewModel.displayValue]);
    },

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

    compatAutoComplete: function (autoComplete) {
        if (typeof autoComplete === 'boolean') {
            return autoComplete ? 'on' : 'off';
        }

        return autoComplete;
    },

    updateViewModel: function (self, newOptions, newValue) {
        if (!isEqual(self._viewModel.options, newOptions)) {
            self._viewModel.options = newOptions;
        }

        if (self._viewModel.value !== newValue) {
            self._viewModel.value = newValue;
        }

        _private.updateSelectionByOptions(self, newOptions);
    },

    getValue: function (self, options) {
        if (options.hasOwnProperty('value')) {
            return options.value === undefined ? self._defaultValue : options.value;
        }

        if (self._viewModel) {
            return self._viewModel.value;
        }

        return self._defaultValue;
    },

    updateSelectionByOptions: function(self, options) {
        if (
            options.hasOwnProperty('selectionStart') &&
            options.hasOwnProperty('selectionEnd') &&
            (self._options.selectionStart !== options.selectionStart || self._options.selectionEnd !== options.selectionEnd)
        ) {
            self._viewModel.selection = {
                start: options.selectionStart,
                end: options.selectionEnd
            };
        }
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

    _updateSelection: function (selection) {
        return this._getField().setSelectionRange(selection.start, selection.end);
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
     * @type {Controls/_utils/sizeUtils/hasHorizontalScroll}
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

    _currentVersionModel: null,

    /**
     * @type {Controls/_input/Render#style}
     * @protected
     */
    _renderStyle() {
        return '';
    },

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
        const ctr = this._getViewModelConstructor();
        this._viewModel = new ctr(
            this._getViewModelOptions(options),
            _private.getValue(this, options)
        );
        _private.updateSelectionByOptions(this, options);
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
    },

    _afterMount: function () {
        this._hidePlaceholder = false;
    },

    _beforeUpdate: function (newOptions) {
        const newViewModelOptions = this._getViewModelOptions(newOptions);
        this._viewModel.displayValueBeforeUpdate = this._viewModel.displayValue;
        _private.updateViewModel(this, newViewModelOptions, _private.getValue(this, newOptions));
        _private.updateSelectionByOptions(this, newOptions);
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
                inputCallback: options.inputCallback,
                calculateValueForTemplate: this._calculateValueForTemplate.bind(this),
                recalculateLocationVisibleArea: this._recalculateLocationVisibleArea.bind(this),
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

    _cutHandler: function () {
        // redefinition
    },
    _copyHandler: function () {
        // redefinition
    },
    _keyUpHandler: function () {
        // redefinition
    },
    _keyDownHandler: function (event) {
        processKeydownEvent(event);
    },
    _selectHandler: function () {
        // redefinition
    },
    _focusOutHandler: function () {
        // redefinition
    },
    _touchStartHandler: function () {
        // redefinition
    },
    /**
     * Event handler click in native field.
     * @private
     */
    _clickHandler: function () {
        this._firstClick = false;
    },

    _inputHandler: function (event) {
        // redefinition
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

    _focusInHandler: function (event) {
        if (this._options.selectOnClick) {
            this._viewModel.select();
        }

        if (this._focusByMouseDown) {
            this._firstClick = true;
            this._focusByMouseDown = false;
        }
    },

    _mouseDownHandler: function () {
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
    _getTooltip(): string {
        let hasFieldHorizontalScroll: boolean = false;
        const field = this._getField();
        const readOnlyField: HTMLInputElement = this._getReadOnlyField();

        if (field) {
            hasFieldHorizontalScroll = field.hasHorizontalScroll();
        } else if (readOnlyField) {
            hasFieldHorizontalScroll = this._hasHorizontalScroll(readOnlyField);
        }

        return hasFieldHorizontalScroll ? this._viewModel.displayValue : this._options.tooltip;
    },

    _calculateValueForTemplate: function () {
        return this._viewModel.displayValue;
    },

    /**
     * Изменение расположения видимой области поля так, чтобы отобразился курсор.
     * Если курсор виден, расположение не изменяется. В противном случае новое местоположение будет таким, что курсор отобразится в середине области.
     */
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

    paste(text: string): void {
        this._getField().paste(text);
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
        selectionStart: entity.descriptor(Number),
        selectionEnd: entity.descriptor(Number),
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
