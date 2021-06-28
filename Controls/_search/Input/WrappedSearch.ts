import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_search/Input/WrappedSearch';
import Search from 'Controls/_search/Input/Search';

/**
 * Контрол "Строка поиска". Является однострочным полем ввода. Контрол используют в реестрах для ввода поискового запроса.
 * Функционал контрола идентичен полям ввода из библиотеки {@link Controls/input}, однако в отличие от них имеет собственное визуальное оформление.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
 * * {@link https://github.com/saby/wasaby-controls/blob/691ea993b54186e06053160a2c88d66fb629f4ed/Controls-default-theme/variables/_search.less переменные тем оформления}
 *
 * @mixes Controls/search:Input
 * @extends Controls/_input/Base
 *
 * @mixes Controls/input:IText
 * @implements Controls/interface:IContrastBackground
 *
 * @ignoreoptions style
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
 * @mixes Controls/search:Input
 * @extends Controls/_input/Base
 *
 * @mixes Controls/input:IText
 * @implements Controls/interface:IContrastBackground
 *
 * @ignoreoptions style
 *
 *
 * @public
 * @demo Controls-demo/Search/Input/Base/Index
 *
 * @author Золотова Э.Е.
 */
export default class WrappedSearch extends Control {
    _template: TemplateFunction = template;
    protected _children: {
        search: Search;
    };

    paste(
        ...args: Parameters<Search['paste']>
    ): ReturnType<Search['paste']> {
        return this._children.search.paste(...args);
    }

    reset(
        ...args: Parameters<Search['reset']>
    ): ReturnType<Search['reset']> {
        return this._children.search.reset(...args);
    }

    _getTooltip(
        ...args: Parameters<Search['_getTooltip']>
    ): ReturnType<Search['_getTooltip']> {
        return this._children.search._getTooltip(...args);
    }
}

/**
 * @event Происходит при нажатии на иконку поиска (лупы).
 * @name Controls/_suggest/Input/Search/Suggest#searchClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
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
 * @name Controls/_search/Input/WrappedSearch#searchClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} nativeEvent Объект нативного события браузера.
 */

/**
 * @event Происходит при клике на кнопку сброса.
 * @name Controls/_search/Input/WrappedSearch#resetClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
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
 * @name Controls/_search/Input/WrappedSearch#searchClick
 */
/*
 * @event Occurs when reset button is clicked.
 * @name Controls/_search/Input/WrappedSearch#resetClick
 */

/**
 * @name Controls/_search/Input/WrappedSearch#searchButtonAlign
 * @cfg {String} Определяет, с какой стороны расположена иконка лупы.
 * @variant left Иконка лупы расположена слева.
 * @variant right Иконка лупы расположена справа.
 * @default right
 */

/**
 * @name Controls/_search/Input/WrappedSearch#searchButtonIconStyle
 * @cfg {String} Цвет иконки лупы. См. {@link Controls/interface:IIconStyle#iconStyle подробнее}.
 */

/**
 * @name Controls/_search/Input/WrappedSearch#searchButtonVisible
 * @cfg {Boolean} Определяет отображение иконки лупы внутри поля поиска, клик по которой запускает поиск.
 * @default true
 * @remark
 * * true - иконка отображается.
 * * false - иконка не отображается.
 */

/**
 * @name Controls/_search/Input/WrappedSearch#contrastBackground
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

/**
 * Сбрасывает значение в строке поиска
 * @name  Controls/_search/Input/WrappedSearch#reset
 * @function
 * @example
 * <pre class="brush: js">
 * // TS
 * private _resetSearchValue():void {
 *     this._children.search.reset();
 * }
 * </pre>
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button caption='Reset filter' on:click='_resetFilter()'/>
 * <Controls.search:Input name='search'>
 *     ...
 * </Controls.search:Input>
 * </pre>
 */
