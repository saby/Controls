import Base = require('Controls/_input/Base');
import entity = require('Types/entity');
import ViewModel = require('Controls/_input/Password/ViewModel');
import {InputHistory} from 'Controls/_input/FixBugs/InputHistory';
import passwordVisibilityButtonTemplate = require('wml!Controls/_input/Password/PasswordVisibilityButton');
/**
 * Поле ввода пароля.
 *
 * @remark
 * Контрол скрывает введенные символы и вместо них отображает символы-заменители.
 * Видимость введенного текста можно переключить, нажав на иконку 'eye'.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/password/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Password
 * @extends Controls/_input/Base
 *
 * @public
 * @demo Controls-demo/Input/Password/Base/Index
 *
 * @author Красильников А.С.
 */

/*
 *  Control that hides all entered characters and shows replacer-symbols in place of them.
 *  Visibility of entered text can be toggled by clicking on 'eye' icon.
 *  <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">Configured Inputs Demo.</a>.
 *
 * @class Controls/_input/Password
 * @extends Controls/_input/Base
 *
 * @public
 * @demo Controls-demo/Input/Password/Base/Index
 *
 * @author Красильников А.С.
 */

/**
 * @name Controls/_input/Password#revealable
 * @cfg {Boolean} В значении true в поле ввода присутствует кнопка-переключатель видимости введённых символов.
 * @default true
 * @remark
 *
 * Кнопка не отображается в {@link readOnly режиме чтения} и в незаполненном поле.
 */

/*
 * @name Controls/_input/Password#revealable
 * @cfg {Boolean} Determines whether to enables the reveal toggle button that will show the password in clear text.
 * @default true
 * @remark
 *
 * The button does not appear in {@link readOnly read mode} or in an empty field.
 */


var _private = {
    calculateType: function (passwordVisible, autoComplete) {
        return passwordVisible || !autoComplete ? 'text' : 'password';
    },

    isVisibleButton: function () {
        return !this._options.readOnly && this._viewModel.displayValue && this._options.revealable;
    },

    isVisiblePassword: function () {
        return this._passwordVisible;
    },
    getTheme: function () {
        return this._options.theme;
    },
    isAutoComplete: function (autoComplete) {
        return autoComplete !== 'off';
    }
};

var Password = Base.extend({
    _passwordVisible: false,
    _defaultValue: '',
    _inputHistory: null,

    _inputHandler: function() {
        /**
         * Браузерное автодополнение отключается с помощью <input type="text"/> и замены введенного значения
         * на *. Из-за этого нарушается нативное поведение по ctrl + [shift] + z. Эмулируем сами историю ввода
         * и переход по ней.
         */
        if (!this._inputHistory && !_private.isAutoComplete(this._autoComplete)) {
            this._inputHistory = new InputHistory({
                value: this._viewModel.displayValue,
                carriagePosition: this._viewModel.selection.end
            });
        }

        Password.superclass._inputHandler.apply(this, arguments);

        if (this._inputHistory) {
            this._inputHistory.add({
                value: this._viewModel.value,
                carriagePosition: this._viewModel.selection.end
            });
        }
    },

    _keyDownHandler: function(event) {
        Password.superclass._keyDownHandler.apply(this, arguments);

        if (this._inputHistory) {
            const keyCodeZ: number = 90;
            if (event.nativeEvent.keyCode === keyCodeZ && event.nativeEvent.ctrlKey) {
                const result = event.nativeEvent.shiftKey ?
                    this._inputHistory.forward() :
                    this._inputHistory.back();
                if (result !== false) {
                    this._viewModel.value = result.value;
                    this._viewModel.selection = result.carriagePosition;
                    this._notifyValueChanged();
                }
                event.preventDefault();
            }
        }
    },

    _getViewModelOptions: function (options) {
        return {
            readOnly: options.readOnly,
            autoComplete: _private.isAutoComplete(this._autoComplete),
            passwordVisible: this._passwordVisible
        };
    },

    _getViewModelConstructor: function () {
        return ViewModel;
    },

    _cutHandler: function(event) {
        Password.superclass._cutHandler.apply(this, arguments);

        /**
         * Запрещаем вырезать текст, если пароль скрыт.
         */
        if (!this._passwordVisible) {
            event.preventDefault();
        }
    },

    _copyHandler: function(event) {
        Password.superclass._copyHandler.apply(this, arguments);

        /**
         * Запрещаем копировать текст, если пароль скрыт.
         */
        if (!this._passwordVisible) {
            event.preventDefault();
        }
    },

    _initProperties: function (options) {
        Password.superclass._initProperties.apply(this, arguments);
        const CONTROL_NAME: string = 'Password';

        this._field.scope.controlName = CONTROL_NAME;
        this._readOnlyField.scope.controlName = CONTROL_NAME;

        this._type = _private.calculateType(this._passwordVisible, _private.isAutoComplete(this._autoComplete));

        this._type = _private.calculateType(this._passwordVisible, _private.isAutoComplete(this._autoComplete));

        this._rightFieldWrapper.template = passwordVisibilityButtonTemplate;
        this._rightFieldWrapper.scope.getTheme = _private.getTheme.bind(this);
        this._rightFieldWrapper.scope.horizontalPadding = options.horizontalPadding;
        this._rightFieldWrapper.scope.isVisibleButton = _private.isVisibleButton.bind(this);
        this._rightFieldWrapper.scope.isVisiblePassword = _private.isVisiblePassword.bind(this);
    },

    _getTooltip: function () {
        /**
         * If the password is hidden, there should be no tooltip. Otherwise, the tooltip is defined as usual.
         */
        if (this._passwordVisible) {
            return Password.superclass._getTooltip.apply(this, arguments);
        }

        return '';
    },

    _toggleVisibilityHandler: function () {
        var passwordVisible = !this._passwordVisible;

        this._passwordVisible = passwordVisible;
        this._forceUpdate();
        this._type = _private.calculateType(passwordVisible, _private.isAutoComplete(this._autoComplete));
    }
});

Password._theme = Base._theme.concat(['Controls/input']);

Password.getDefaultOptions = function () {
    var defaultOptions = Base.getDefaultOptions();

    defaultOptions.revealable = true;
    defaultOptions.autoComplete = 'on';

    return defaultOptions;
};

Password.getOptionTypes = function getOptionsTypes() {
    var optionTypes = Base.getOptionTypes();

    optionTypes.revealable = entity.descriptor(Boolean);

    return optionTypes;
};

export = Password;
