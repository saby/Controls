import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_search/Input/Container';
import { SyntheticEvent } from 'UICommon/Events';
import SearchResolver from 'Controls/_search/SearchResolver';
import {constants} from 'Env/Env';

export interface ISearchInputContainerOptions extends IControlOptions {
   searchDelay?: number | null;
   minSearchLength?: number;
   inputSearchValue?: string;
}

/**
 * Контрол-контейнер для полей ввода, реализует функционал проверки количества введённых символов,
 * а также задержку между вводом символа в строку и выполнением поискового запроса.
 * @remark
 * Контрол принимает решение по событию valueChanged, должно ли сработать событие search или нет,
 * в зависимости от заданных параметров поиска - минимальной длины для начала поиска и времени задержки.
 *
 * Использование c контролом {@link Controls/browser:Browser} можно посмотреть в демо {@link /materials/Controls-demo/app/Controls-demo%2FSearch%2FFlatList%2FIndex Controls-demo/Search/FlatList}
 *
 * @example
 * <pre>
 *    <Controls.search:InputContainer on:search="_search()" on:searchReset="_searchReset()">
 *       <Controls.search:Input/>
 *    </Controls.search:InputContainer>
 * </pre>
 * <pre>
 *    class ExampleControl extends Control {
 *       ...
 *       protected _search(event: SyntheticEvent, value: string) {
 *          // Выполняем поиск
 *       }
 *       protected _searchReset(event: SyntheticEvent) {
 *          // Сбрасываем поиск
 *       }
 *       ...
 *    }
 * </pre>
 * @class Controls/_search/Input/Container
 * @extends UI/Base:Control
 * @demo Controls-demo/Search/Explorer/Index
 * @demo Controls-demo/Search/FlatList/Index
 * @demo Controls-demo/Search/TreeView/Index
 * @public
 * @author Крюков Н.Ю.
 */
export default class Container extends Control<ISearchInputContainerOptions> {
   protected _template: TemplateFunction = template;

   protected _value: string;
   protected _searchResolverController: SearchResolver = null;

   protected _beforeMount(options?: ISearchInputContainerOptions): void {
      if (options.inputSearchValue) {
         this._searchResolverController = this._initializeSearchResolverController(options);
         this._updateSearchData(options.inputSearchValue, options.minSearchLength);
      }
   }

   protected _beforeUnmount(): void {
      if (this._searchResolverController) {
         this._searchResolverController.clearTimer();
      }
   }

   protected _beforeUpdate(newOptions: ISearchInputContainerOptions): void {
      if (this._options.inputSearchValue !== newOptions.inputSearchValue) {
         this._updateSearchData(newOptions.inputSearchValue, newOptions.minSearchLength);
      }
   }

   protected _getSearchResolverController(): SearchResolver {
      if (!this._searchResolverController) {
         this._searchResolverController = this._initializeSearchResolverController(this._options);
      }

      return this._searchResolverController;
   }

   private _initializeSearchResolverController(options: ISearchInputContainerOptions): SearchResolver {
      return new SearchResolver({
         searchDelay: options.searchDelay,
         minSearchLength: options.minSearchLength,
         searchCallback: this._notifySearch.bind(this),
         searchResetCallback: this._notifySearchReset.bind(this)
      });
   }

   protected _notifySearch(value: string): void {
      this._resolve(value, 'search');
   }

   protected _notifySearchReset(): void {
      this._resolve('', 'searchReset');
   }

   private _updateSearchData(inputSearchValue: string, minSearchLength: number): void {
      const searchResolver = this._getSearchResolverController();
      if (this._value !== inputSearchValue) {
         this._value = inputSearchValue;

         if (!inputSearchValue) {
            searchResolver.clearTimer();
         }
         searchResolver.setSearchStarted(this._value && this._value.length >= minSearchLength);
      }
   }

   private _resolve(value: string, event: 'searchReset' | 'search'): void {
      this._notify(event, [value], { bubbling: true });
   }

   protected _searchClick(event: SyntheticEvent): void {
      if (this._value) {
         this._getSearchResolverController().setSearchStarted(true);
         this._resolve(this._value, 'search');
      }
   }

   protected _valueChanged(event: SyntheticEvent, value: string): void {
      if (this._value !== value) {
         this._value = value;
         this._getSearchResolverController().resolve(value);
         this._notify('inputSearchValueChanged', [value], {bubbling: true});
      }
   }

   protected _keyDown(event: SyntheticEvent<KeyboardEvent>): void {
      if (event.nativeEvent.which === constants.key.enter) {
         event.stopPropagation();
      }
   }

   static getDefaultOptions(): ISearchInputContainerOptions {
      return {
         minSearchLength: 3,
         searchDelay: 500
      };
   }
}

/**
 * @name Controls/_search/Input/Container#searchDelay
 * @cfg {number|null} Время задержки перед поиском
 * @demo Controls-demo/Search/Explorer/Index
 * @demo Controls-demo/Search/FlatList/Index
 * @demo Controls-demo/Search/TreeView/Index
 */

/**
 * @name Controls/_search/Input/Container#minSearchLength
 * @cfg {number} Минимальная длина значения для начала поиска
 * @demo Controls-demo/Search/Explorer/Index
 * @demo Controls-demo/Search/FlatList/Index
 * @demo Controls-demo/Search/TreeView/Index
 */

/**
 * @name Controls/_search/Input/Container#inputSearchValue
 * @cfg {string} Значение строки ввода
 * @demo Controls-demo/Search/Explorer/Index
 * @demo Controls-demo/Search/FlatList/Index
 * @demo Controls-demo/Search/TreeView/Index
 */

/**
 * @event Происходит при начале поиска
 * @name Controls/_search/Input/Container#search
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {value} string Значение по которому производится поиск.
 */

/**
 * @event Происходит при сбросе поиска
 * @name Controls/_search/Input/Container#searchReset
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */

Object.defineProperty(Container, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Container.getDefaultOptions();
   }
});
