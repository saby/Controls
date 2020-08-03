import entity = require('Types/entity');
import Text = require('Controls/_input/Text');
import {delay as runDelayed} from 'Types/function';
import template = require('wml!Controls/_input/Area/Area');
import fieldTemplate = require('wml!Controls/_input/Area/Field');
import readOnlyFieldTemplate = require('wml!Controls/_input/Area/ReadOnly');

import {Logger} from 'UI/Utils';
import {detection, constants} from 'Env/Env';

import 'Controls/decorator';

/**
 * Многострочное поле ввода текста.
 * @remark
 * Вы можете настроить {@link minLines минимальное} и {@link maxLines максимальное} количество строк.
 * Когда вводимый текст превысит ограничение {@link maxLines}, в поле появится скролл и оно перестанет увеличиваться по высоте.
 * Вы можете переместить текст в следующую строку с помощью {@link newLineKey горячих клавиш}.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/text/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Area
 * @extends Controls/input:Text
 * @mixes Controls/input:INewLineKey
 *
 * @public
 * @demo Controls-demo/Input/Area/MinMaxLines/Index
 *
 * @author Красильников А.С.
 */

/*
 * A component for entering multi-line text.
 * You can adjust the {@link minLines minimum} and {@link maxLines maximum} number of lines.
 * If the inputed text does not fit on the {@link maxLines number of lines}, a scroll bar appears.
 * You can move the text to the next line using {@link newLineKey hotkeys}.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">Демо-пример</a>.
 *
 * @class Controls/_input/Area
 * @extends Controls/_input/Text
 * @mixes Controls/_input/interface/INewLineKey
 *
 * @public
 * @demo Controls-demo/Input/Area/MinMaxLines/Index
 *
 * @author Красильников А.С.
 */

/**
 * @name Controls/_input/Area#minLines
 * @cfg {Number} Минимальное количество строк.
 * @remark
 * Определяет минимальную высоту поля ввода, при этом в поле может быть введено сколько угодно строк текста.
 * Поддерживается значение от 1 до 10.
 * @see maxLines
 * @default 1
 */

/*
 * @name Controls/_input/Area#minLines
 * @cfg {Number} Minimum number of lines.
 * @remark
 * A value between 1 and 10 is supported.
 * @default 1
 */

/**
 * @name Controls/_input/Area#maxLines
 * @cfg {Number} Максимальное количество строк.
 * @remark
 * Определяет максимальную высоту поля ввода, при этом в поле может быть введено сколько угодно строк текста. Если максимальная высота не равна минимальной, то поле ввода тянется по высоте при вводе текста.
 * При вводе текста, превышающего максимальную высоту, в поле ввода появляется скролл.
 * Поддерживается значение от 1 до 10.
 * @see minLines
 */

/*
 * @name Controls/_input/Area#maxLines
 * @cfg {Number} Maximum number of lines.
 * @remark
 * A value between 1 and 10 is supported.
 */

/**
 * @name Controls/_input/Area#footerTemplate
 * @cfg {String|TemplateFunction} Строка или шаблон, содержащие контент подвала, который будет отображаться в многострочном поле.
 * @demo Controls-demo/Input/FooterTemplate/Index
 */

/**
 * @name Controls/_input/Area#optimizeShadow
 * @cfg {Boolean} Включает режим быстрой отрисовки тени.
 * @default true
 * @variant true Оптимизированные тени.
 * @variant false Не оптимизированные тени.
 * @remark
 * Отключите оптимизированные тени, если:
 * <ul>
 *      <li> У input:Area непрозрачный фон </li>
 *      <li> input:Area находится в элементе с непрозрачным фоном </li>
 * </ul>
 */

var _private = {
    calcPositionCursor: function (container, textBeforeCursor) {
        var measuredBlock = document.createElement('div');

        /**
         * In order for the block to have the correct height, you need to add an empty character to the end.
         * Without it, the height, in the case of an empty value, will be zero.
         * In the case when at the end of the transition to a new line height will be one line less.
         */
        measuredBlock.innerText = textBeforeCursor + '&#65279;';
        container.appendChild(measuredBlock);
        var position = measuredBlock.clientHeight;
        container.removeChild(measuredBlock);

        return position;
    },

    /**
     * @param event
     * @param {String} [key]
     * @variant altKey
     * @variant ctrlKey
     * @variant shiftKey
     * @return {Boolean}
     */
    isPressAdditionalKey: function (event, key) {
        var additionalKeys = ['shiftKey', 'altKey', 'ctrlKey'];

        return additionalKeys.every(function (additionalKey) {
            if (additionalKey === key) {
                return event[additionalKey];
            }

            return !event[additionalKey];
        });
    },

    isPressEnter: function (event) {
        return event.keyCode === constants.key.enter;
    },

    isPressCtrl: function (event) {
        return _private.isPressAdditionalKey(event, 'ctrlKey');
    },

    isPressAdditionalKeys: function (event) {
        return !_private.isPressAdditionalKey(event);
    },

    /**
     * Изменение расположения видимой области поля так, чтобы отобразился курсор.
     * Если курсор виден, расположение не изменяется. В противном случае новое местоположение будет таким, что курсор отобразится в середине области.
     * @param {Controls/_input/Base} self Экземпляр контрола.
     * @param {String} value
     * @param {Controls/_input/Base/Types/Selection.typedef} selection
     */

    /*
     * Change the location of the visible area of the field so that the cursor is visible.
     * If the cursor is visible, the location is not changed. Otherwise, the new location will be such that
     * the cursor is visible in the middle of the area.
     * @param {Controls/_input/Base} self Control instance.
     * @param {String} value
     * @param {Controls/_input/Base/Types/Selection.typedef} selection
     */
    recalculateLocationVisibleArea: function (self, value, selection) {
        var scroll = self._children.scroll;
        var textBeforeCursor = value.substring(0, selection.end);

        var positionCursor = _private.calcPositionCursor(self._children.fieldWrapper, textBeforeCursor);

        /**
         * По другому до clientHeight не достучаться.
         * https://online.sbis.ru/opendoc.html?guid=1d24c04f-73d0-4e0f-9b61-4d0bc9c23e2f
         */
            //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        const container = scroll._container.get ? scroll._container.get(0) : scroll._container;
        var sizeVisibleArea = container.clientHeight;

        // По другому до scrollTop не достучаться.
        // https://online.sbis.ru/opendoc.html?guid=e1770341-9126-4480-8798-45b5c339a294
        var beginningVisibleArea = scroll._children.content.scrollTop;

        var endingVisibleArea = beginningVisibleArea + sizeVisibleArea;

        /**
         * The cursor is visible if its position is between the beginning and the end of the visible area.
         */
        var hasVisibilityCursor = beginningVisibleArea < positionCursor && positionCursor < endingVisibleArea;

        if (!hasVisibilityCursor) {
            /**
             * At the time of the scroll position change, the DOM must be updated.
             * So wait until the control redraws.
             */
            runDelayed(function () {
                self._getField().scrollTop = 0;
                scroll.scrollTo(positionCursor - sizeVisibleArea / 2);
            });
        }
    },

    validateLines: function (min, max, self) {
        var validated = true;
        self._minLines = min;
        self._maxLines = max;

        if (min > max) {
            validated = false;
            self._minLines = max;
            self._maxLines = min;
            Logger.error('Controls/_input/Area: The minLines and maxLines options are not set correctly. The minLines more than the maxLines.', self);
        }

        if (min < 1) {
            validated = false;
            self._minLines = 1;
            Logger.error('Controls/_input/Area: The minLines options are not set correctly. The minLines less than one.', self);
        }

        if (max < 1) {
            validated = false;
            self._maxLines = 1;
            Logger.error('Controls/_input/Area: The maxLines options are not set correctly. The maxLines less than one.', self);
        }

        if (min > 10 || max > 10) {
            validated = false;
            self._minLines = 10;
            self._maxLines = 10;
            Logger.error('Controls/_input/Area: The minLines and maxLines options are not set correctly. Values greater than 10 are not supported.', self);
        }

        return validated;
    },

    newLineHandler: function (self, event, isNewLinePaste) {
        const nativeEvent = event.nativeEvent;

        /**
         * If a new line is added, then stop the bubbling of the event.
         * Because, only we should respond to the addition of a new line.
         */
        if (_private.isPressEnter(nativeEvent)) {
            if (self._options.newLineKey === 'ctrlEnter' && _private.isPressCtrl(nativeEvent)) {
                if (isNewLinePaste) {
                    self.paste('\n');
                }
                event.stopPropagation();
            } else if (self._options.newLineKey !== 'enter' || _private.isPressAdditionalKeys(nativeEvent)) {
                event.preventDefault();
            } else {
                event.stopPropagation();
            }
        }
    },
    fixSyncFakeArea: function (self) {
        /**
         * 1) На MacOS иногда между выпонением обработчика и перерестроением успевает перерисоваться страница. Из-за этого происходят скачки.
         * 2) В chrome иногда, когда происходит увеличение количества строк, при вставке, не происходит отрисовки текста на новых строках.
         * Значение в textarea меняется в обработчике события input, а значение в fakeField в шаблоне на момент перестроения.
         * Так как размеры textarea зависят от fakeField, поэтому их значения на момент перерисовки страници должны быть одинаковыми. Иначе
         * возникают проблемы 1-2. Чтобы избежать проблем меняем значение fakeField в обработчике.
         */
        if (detection.isMacOSDesktop || detection.chrome) {
            self._children.fakeField.innerText = self._viewModel.displayValue + self._field.scope.emptySymbol;
        }
    }
};

var Area = Text.extend({
    _template: template,

    _multiline: true,
    _minLines: null,
    _maxLines: null,

    _beforeMount: function (options) {
        Area.superclass._beforeMount.apply(this, arguments);

        _private.validateLines(options.minLines, options.maxLines, this);
    },

    _beforeUpdate: function (newOptions) {
        Area.superclass._beforeUpdate.apply(this, arguments);

        if (this._options.minLines !== newOptions.minLines || this._options.maxLines !== newOptions.maxLines) {
            _private.validateLines(newOptions.minLines, newOptions.maxLines, this);
        }
    },

    _inputHandler: function () {
        Area.superclass._inputHandler.apply(this, arguments);

        _private.fixSyncFakeArea(this);

        this._recalculateLocationVisibleArea(this._getField(), this._viewModel.displayValue, this._viewModel.selection);
    },

    _updateFieldInTemplate: function () {
        Area.superclass._updateFieldInTemplate.apply(this, arguments);
        _private.fixSyncFakeArea(this);
    },

    _keyDownHandler: function (event) {
        Area.superclass._keyDownHandler.apply(this, arguments);

        _private.newLineHandler(this, event, true);
    },

    _keyPressHandler: function (event) {
        _private.newLineHandler(this, event, false);
    },

    _keyUpHandler: function (event) {
        Area.superclass._keyUpHandler.apply(this, arguments);

        _private.newLineHandler(this, event, false);

        /**
         * После нажатия на стрелки клавиатуры, происходит перемещение курсора в поле.
         * В результате перемещения, курсор может выйти за пределы видимой области, тогда произойдет
         * прокрутка в scroll:Container. Отступы не учитываются при прокрутке. Поэтому, когда курсор
         * находится в начале или в конце, тогда scroll:Container не докручивается, остается тень.
         * В такой ситуации будем докручивать самостоятельно.
         */
        const keyCode = event.nativeEvent.keyCode;
        if (keyCode >= constants.key.end && keyCode <= constants.key.down) {
            const cursorPosition: number = this._viewModel.selection.end;
            const beforeValue: string = this._viewModel.displayValue.substring(0, cursorPosition);
            const afterValue: string = this._viewModel.displayValue.substring(cursorPosition);
            const onFirstLine: boolean = beforeValue.indexOf('\n') === -1;
            const onLastLine: boolean = afterValue.indexOf('\n') === -1;
            if (onFirstLine) {
                this._children.scroll.scrollTo(0);
            } else if (onLastLine) {
                this._children.scroll.scrollTo(this._getField().offsetHeight);
            }
        }
    },

    _recalculateLocationVisibleArea: function (field, displayValue, selection) {
        _private.recalculateLocationVisibleArea(this, displayValue, selection);
    },

    _initProperties: function (options) {
        Area.superclass._initProperties.apply(this, arguments);

        this._field.template = fieldTemplate;
        this._readOnlyField.template = readOnlyFieldTemplate;

        /**
         * https://stackoverflow.com/questions/6890149/remove-3-pixels-in-ios-webkit-textarea
         */
        const verWithFixedBug: number = 13;
        this._field.scope.fixTextPosition = detection.isMobileIOS && detection.IOSVersion < verWithFixedBug;
    },

    _isTriggeredChangeEventByEnterKey: function () {
        return false;
    }
});

Area._theme = Text._theme.concat(['Controls/input']);

Area.getDefaultOptions = function () {
    var defaultOptions = Text.getDefaultOptions();

    defaultOptions.minLines = 1;
    defaultOptions.newLineKey = 'enter';
    defaultOptions.optimizeShadow = true;

    return defaultOptions;
};

Area.getOptionTypes = function () {
    const optionTypes = Text.getOptionTypes();

    optionTypes.minLines = entity.descriptor(Number, null);
    optionTypes.maxLines = entity.descriptor(Number, null);
    optionTypes.newLineKey = entity.descriptor(String).oneOf([
        'enter',
        'ctrlEnter'
    ]);

    return optionTypes;
};

export = Area;

