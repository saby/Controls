import rk = require('i18n!Controls');
import * as buttonsTemplate from 'wml!Controls/_search/Input/Buttons';
import {generateStates, Base, TextViewModel as ViewModel} from 'Controls/input';
import {throttle} from 'Types/function';
import {descriptor} from 'Types/entity';
import {constants} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';

// timer for search, when user click on search button or pressed enter.
// protect against clickjacking (https://en.wikipedia.org/wiki/Clickjacking)
const SEARCH_BY_CLICK_THROTTLE = 300;

let _private = {
    isVisibleResetButton() {
        return !!this._viewModel.displayValue && !this._options.readOnly;
    },

    calculateStateButton() {
        return this._options.readOnly ? '_readOnly' : '';
    }
};

/**
 * Контрол "Строка поиска". Является однострочным полем ввода. Контрол используют в реестрах для ввода поискового запроса.
 * Функционал контрола идентичен полям ввода из библиотеки {@link Controls/input}, однако в отличие от них имеет собственное визуальное оформление.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_search.less переменные тем оформления}
 *
 * @class Controls/_search/Input/Search
 * @extends Controls/_input/Base
 *
 * @mixes Controls/_input/interface/IText
 * @implements Controls/interface:IContrastBackground
 *
 * @ignoreOptions style
 *
 *
 * @public
 * @demo Controls-demo/Search/Input/Base/Index
 *
 * @author Золотова Э.Е.
 */

/*
 * Controls that allows user to enter single-line text.
 * These are functionally identical to text inputs, but may be styled differently.
 *
 * Information on searching settings in the list using the "input:Search" control you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FSearch%2FContainer">Demo with Input/Search and List control</a>.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FFilterSearch%2FFilterSearch">Demo with Filter/Button, Input/Search and List control</a>.
 *
 * @class Controls/_search/Input/Search
 * @extends Controls/_input/Base
 *
 * @mixes Controls/_input/interface/IText
 * @implements Controls/interface:IContrastBackground
 *
 * @ignoreOptions style
 *
 *
 * @public
 * @demo Controls-demo/Search/Input/Base/Index
 *
 * @author Золотова Э.Е.
 */
class Search extends Base {
    protected _wasActionUser: boolean = false;

    protected _beforeMount(options): void {
        this._notifySearchClick = throttle(this._notifySearchClick, SEARCH_BY_CLICK_THROTTLE, false);
        generateStates(this, options);
        return super._beforeMount.apply(this, arguments);
    }

    protected _renderStyle(): string {
        let style: string;
        if (this._options.contrastBackground) {
            style = 'searchContrast';
        } else {
            style = 'search';
        }
        return style;
    }

    protected _getViewModelOptions(options) {
        return {
            maxLength: options.maxLength,
            constraint: options.constraint
        };
    }

    protected _getViewModelConstructor() {
        return ViewModel;
    }

    protected _initProperties(): void {
        super._initProperties.apply(this, arguments);

        let CONTROL_NAME = 'Search';
        this._field.scope.controlName = CONTROL_NAME;
        this._readOnlyField.scope.controlName = CONTROL_NAME;

        this._rightFieldWrapper.template = buttonsTemplate;
        this._rightFieldWrapper.scope.isVisibleReset = _private.isVisibleResetButton.bind(this);
        this._rightFieldWrapper.scope.calculateState = _private.calculateStateButton.bind(this);
    }

    protected _notifyInputCompleted(): void {
        if (this._options.trim) {
            let trimmedValue = this._viewModel.displayValue.trim();

            if (trimmedValue !== this._viewModel.displayValue) {
                this._viewModel.displayValue = trimmedValue;
                this._notifyValueChanged();
            }
        }

        super._notifyInputCompleted.apply(this, arguments);
    }

    protected _resetClick(): void {
        if (this._options.readOnly) {
            return;
        }

        this._notify('resetClick');

        this._viewModel.displayValue = '';
        this._notifyValueChanged();

        // move focus from clear button to input
        this.activate();
    }

    protected _resetMousedown(event): void {
        event.stopPropagation();
        event.preventDefault();
    }

    protected _searchClick(event: SyntheticEvent): void {
        if (this._options.readOnly) {
            return;
        }

        this._notifySearchClick(event);

        // move focus from search button to input
        this.activate();
    }

    protected _notifySearchClick(event): void {
        this._notify('searchClick', [event.nativeEvent]);
    }

    protected _keyUpHandler(event: SyntheticEvent<KeyboardEvent>): void {
        if (event.nativeEvent.which === constants.key.enter) {
            this._searchClick(event);
        }

        super._keyUpHandler.apply(this, arguments);
    }

    protected _inputHandler(): void {
        super._inputHandler.apply(this, arguments);

        this._wasActionUser = true;
    }

    protected _clickHandler(): void {
        super._clickHandler.apply(this, arguments);

        this._wasActionUser = true;
    }

    static _theme: string[] = Base._theme.concat(['Controls/search']);

    static _private = _private;

    static getDefaultOptions(): object {
       let defaultOptions = Base.getDefaultOptions();
       defaultOptions.contrastBackground = false;
       defaultOptions.trim = false;
       defaultOptions.placeholder = rk('Найти') + '...';
       defaultOptions.searchButtonVisible = true;
       defaultOptions.validationStatus = 'valid';
       defaultOptions.spellcheck = false;

       return defaultOptions;
    }

    static getOptionTypes(): object {
       let optionTypes = Base.getOptionTypes();

       optionTypes.maxLength = descriptor(Number, null);
       optionTypes.trim = descriptor(Boolean);
       optionTypes.constraint = descriptor(String);

       return optionTypes;
    }
}

/**
 * @event Происходит при нажатии на иконку поиска (лупы).
 * @name Controls/_suggest/Input/Search/Suggest#searchClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @remark Клик по иконке поиска закрывает автодополнение. Это поведение можно отменить, если из события вернуть false.
 * @example
 * * WML
 * <pre>
 *     <Controls.suggest:SearchInput on:searchClick="_searchClick()" bind:value="_value">
 *        ...
 *     </Controls.suggest:SearchInput>
 * </pre>
 * * TypeScript
 * <pre>
 *     protected _value: string = '';
 *
 *     private _searchClick():boolean {
 *       //Не закрываем автодополнение при клике на лупу, если введено больше 3 символов
 *       return this._value.length < 3;
 *     }
 * <pre>
 * @default true
 */

/**
 * @event Происходит при клике на кнопку поиска.
 * @name Controls/_search/Input/Search#searchClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} nativeEvent Объект нативного события браузера.
 */

/**
 * @event Происходит при клике на кнопку сброса.
 * @name Controls/_search/Input/Search#resetClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*
 * @event Occurs when search button is clicked.
 * @name Controls/_suggest/Input/Search/Suggest#searchClick
 * @example
 * WML:
 * <pre>
 *     <Controls.suggest:SearchInput on:searchClick="_searchClick()" bind:value="_value">
 *        ...
 *     </Controls.suggest:SearchInput>
 * </pre>
 *
 * TS:
 * <pre>
 *     protected _value: string = '';
 *
 *     private _searchClick():boolean {
 *       return this._value.length < 3;
 *     }
 * <pre>
 */

/*
 * @event Occurs when search button is clicked.
 * @name Controls/_search/Input/Search#searchClick
 */
/*
 * @event Occurs when reset button is clicked.
 * @name Controls/_search/Input/Search#resetClick
 */

/**
 * @name Controls/_search/Input/Search#searchButtonVisible
 * @cfg {Boolean} Определяет отображение иконки лупы внутри поля поиска, клик по которой запускает поиск.
 * @default true
 * @remark
 * * true - иконка отображается.
 * * false - иконка не отображается.
 */

/**
 * @name Controls/_search/Input/Search#contrastBackground
 * @cfg
 * @default false
 * @remark
 * Опция используется для визуального выделения контрола, относительно окружения.
 * Например в ситуации когда цвет окружения, близкий к цвету самого контрола.
 * @demo Controls-demo/Search/Input/Base/Index
 * @example
 * У кнопки контрастный фон.
 * <pre>
 *    <Controls.search:Input contrastBackground="{{true}}" bind:value="_searchValue"/>
 * </pre>
 * @see style
 */

export default Search;
