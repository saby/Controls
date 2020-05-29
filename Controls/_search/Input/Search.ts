import rk = require('i18n!Controls');
import * as buttonsTemplate from 'wml!Controls/_search/Input/Buttons';
import {Base, TextViewModel as ViewModel} from 'Controls/input';
import {throttle} from 'Types/function';
import {descriptor} from 'Types/entity';
import {constants} from 'Env/Env';
import {SyntheticEvent} from "Vdom/Vdom";

// timer for search, when user click on search button or pressed enter.
// protect against clickjacking (https://en.wikipedia.org/wiki/Clickjacking)
const SEARCH_BY_CLICK_THROTTLE = 300;

/**
 * Контрол "Строка поиска". Является однострочным полем ввода. Контрол используют в реестрах для ввода поискового запроса.
 * Функционал контрола идентичен полям ввода из библиотеки {@link Controls/input}, однако в отличие от них имеет собственное визуальное оформление.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">руководство разработчика по организации поиска и фильтрации в реестре</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/">руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_search.less">переменные тем оформления</a>
 *
 * @class Controls/_search/Input/Search
 * @extends Controls/_input/Base
 *
 * @mixes Controls/_input/interface/IText
 *
 * @ignoreOptions style
 *
 * @control
 * @public
 * @demo Controls-demo/Search/Input/Base/Index
 *
 * @category Input
 * @author Золотова Э.Е.
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
 * @cfg {Boolean} Определяет контрастность фона контрола по отношению к ее окружению.
 * @default false
 * @remark
 * * true - контрастный фон.
 * * false - фон, гармонично сочетающийся с окружением.
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
 *
 * @ignoreOptions style
 *
 * @control
 * @public
 * @demo Controls-demo/Search/Input/Base/Index
 *
 * @category Input
 * @author Золотова Э.Е.
 */

/**
 * @event Controls/_suggest/Input/Search/Suggest#searchClick Происходит при нажатии на иконку поиска (лупы).
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
 * @event Controls/_search/Input/Search#searchClick Происходит при клике на кнопку поиска.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} nativeEvent Объект нативного события браузера.
 */

/**
 * @event Controls/_search/Input/Search#resetClick Происходит при клике на кнопку сброса.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*
 * @event Controls/_suggest/Input/Search/Suggest#searchClick Occurs when search button is clicked.
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
 * @event Controls/_search/Input/Search#searchClick Occurs when search button is clicked.
 * @event Controls/_search/Input/Search#resetClick Occurs when reset button is clicked.
 */
var _private = {
   isVisibleResetButton: function() {
      return !!this._viewModel.displayValue && !this._options.readOnly;
   },

   calculateStateButton: function() {
      return this._options.readOnly ? '_readOnly' : '';
   }
};

var Search = Base.extend({
   _wasActionUser: false,

   _beforeMount(): void {
      this._notifySearchClick = throttle(this._notifySearchClick, SEARCH_BY_CLICK_THROTTLE, false);
      return Search.superclass._beforeMount.apply(this, arguments);
   },

   _renderStyle() {
      let style: string;
      if (this._options.contrastBackground) {
         style = 'searchContrast';
      } else {
         style = 'search';
      }
      return style;
   },

   _getViewModelOptions: function(options) {
      return {
         maxLength: options.maxLength,
         constraint: options.constraint
      };
   },

   _getViewModelConstructor: function() {
      return ViewModel;
   },

   _initProperties: function() {
      Search.superclass._initProperties.apply(this, arguments);

      var CONTROL_NAME = 'Search';
      this._field.scope.controlName = CONTROL_NAME;
      this._readOnlyField.scope.controlName = CONTROL_NAME;

      this._rightFieldWrapper.template = buttonsTemplate;
      this._rightFieldWrapper.scope.isVisibleReset = _private.isVisibleResetButton.bind(this);
      this._rightFieldWrapper.scope.calculateState = _private.calculateStateButton.bind(this);
   },

   _changeHandler: function() {
      if (this._options.trim) {
         var trimmedValue = this._viewModel.displayValue.trim();

         if (trimmedValue !== this._viewModel.displayValue) {
            this._viewModel.displayValue = trimmedValue;
            this._notifyValueChanged();
         }
      }

      Search.superclass._changeHandler.apply(this, arguments);
   },

   _resetClick: function() {
      if (this._options.readOnly) {
         return;
      }

      this._notify('resetClick');

      this._viewModel.displayValue = '';
      this._notifyValueChanged();

      // move focus from clear button to input
      this.activate();
   },

   _searchClick(event: SyntheticEvent): void {
      if (this._options.readOnly) {
         return;
      }

      this._notifySearchClick(event);

      // move focus from search button to input
      this.activate();
   },

   _notifySearchClick(event): void {
      this._notify('searchClick', [event.nativeEvent]);
   },

   _keyUpHandler(event: SyntheticEvent<KeyboardEvent>): void {
      if (event.nativeEvent.which === constants.key.enter) {
         this._searchClick(event);
      }

      Search.superclass._keyUpHandler.apply(this, arguments);
   },

   _inputHandler: function() {
      Search.superclass._inputHandler.apply(this, arguments);

      this._wasActionUser = true;
   },

   _clickHandler: function() {
      Search.superclass._clickHandler.apply(this, arguments);

      this._wasActionUser = true;
   }
});

Search._theme = Base._theme.concat(['Controls/search']);

Search.getOptionTypes = function getOptionsTypes() {
   var optionTypes = Base.getOptionTypes();

   optionTypes.maxLength = descriptor(Number, null);
   optionTypes.trim = descriptor(Boolean);
   optionTypes.constraint = descriptor(String);

   return optionTypes;
};

Search.getDefaultOptions = function getDefaultOptions() {
   var defaultOptions = Base.getDefaultOptions();

   defaultOptions.trim = false;
   defaultOptions.placeholder = rk('Найти') + '...';
   defaultOptions.searchButtonVisible = true;
   defaultOptions.validationStatus = 'valid';

   return defaultOptions;
};

Search._private = _private;

export = Search;

