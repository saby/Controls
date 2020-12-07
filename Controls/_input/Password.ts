import {default as Base, IBaseInputOptions} from 'Controls/_input/Base';
import {descriptor} from 'Types/entity';
import * as ViewModel from 'Controls/_input/Password/ViewModel';
import passwordVisibilityButtonTemplate = require('wml!Controls/_input/Password/PasswordVisibilityButton');
import {SyntheticEvent} from 'Vdom/Vdom';

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
class Password extends Base {
    protected _defaultValue: string = '';
    private _passwordVisible: boolean = false;
    protected _controlName: string = 'Password';

    protected _getViewModelOptions(options): object {
        return {
            readOnly: options.readOnly,
            autoComplete: Password._isAutoComplete(this._autoComplete),
            passwordVisible: this._passwordVisible
        };
    }

    protected _getViewModelConstructor(): ViewModel {
        return ViewModel;
    }

    protected _cutHandler(event: SyntheticEvent<KeyboardEvent>): void {
        super._cutHandler.apply(this, arguments);

        /**
         * Запрещаем вырезать текст, если пароль скрыт.
         */
        if (!this._passwordVisible) {
            event.preventDefault();
        }
    }

    protected _copyHandler(event: SyntheticEvent<KeyboardEvent>): void {
        super._copyHandler.apply(this, arguments);

        /**
         * Запрещаем копировать текст, если пароль скрыт.
         */
        if (!this._passwordVisible) {
            event.preventDefault();
        }
    }

    protected _initProperties(options): void {
        super._initProperties.apply(this, arguments);
        const CONTROL_NAME: string = 'Password';

        this._field.scope.controlName = CONTROL_NAME;
        this._readOnlyField.scope.controlName = CONTROL_NAME;

        this._type = Password._calculateType(this._passwordVisible, Password._isAutoComplete(this._autoComplete));

        this._type = Password._calculateType(this._passwordVisible, Password._isAutoComplete(this._autoComplete));

        this._rightFieldWrapper.template = passwordVisibilityButtonTemplate;
        this._rightFieldWrapper.scope.getTheme = this._getTheme.bind(this);
        this._rightFieldWrapper.scope.horizontalPadding = options.horizontalPadding;
        this._rightFieldWrapper.scope.isVisibleButton = this._isVisibleButton.bind(this);
        this._rightFieldWrapper.scope.isVisiblePassword = this._isVisiblePassword.bind(this);
    }

    protected _getTooltip(): string {
        /**
         * If the password is hidden, there should be no tooltip. Otherwise, the tooltip is defined as usual.
         */
        if (this._passwordVisible) {
            return super._getTooltip.apply(this, arguments);
        }

        return '';
    }

    protected _toggleVisibilityHandler(): void {
        let passwordVisible = !this._passwordVisible;

        this._passwordVisible = passwordVisible;
        this._forceUpdate();
        this._type = Password._calculateType(passwordVisible, Password._isAutoComplete(this._autoComplete));
    }

    private _isVisibleButton(): boolean {
        return !this._options.readOnly && this._viewModel.displayValue && this._options.revealable;
    }

    private _isVisiblePassword(): boolean {
        return this._passwordVisible;
    }

    private _getTheme(): string {
        return this._options.theme;
    }

    private static _calculateType(passwordVisible: boolean, autoComplete: boolean): string {
        return passwordVisible || !autoComplete ? 'text' : 'password';
    }

    private static _isAutoComplete(autoComplete: string): boolean {
        return autoComplete !== 'off';
    }

    static _theme: string[] = Base._theme.concat(['Controls/input']);

    static getDefaultOptions() {
        const defaultOptions = Base.getDefaultOptions();

        defaultOptions.revealable = true;
        defaultOptions.autoComplete = 'on';

        return defaultOptions;
    }

    static getOptionTypes(): object {
        const optionTypes = Base.getOptionTypes();

        optionTypes.revealable = descriptor(Boolean);

        return optionTypes;
    }
}

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
export default Password;
