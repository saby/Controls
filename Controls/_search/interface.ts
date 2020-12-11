import {IControlOptions} from 'UI/Base';
import {IHierarchyOptions, ISearchOptions} from 'Controls/interface';
import {NewSourceController} from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import {QueryWhereExpression} from 'Types/source';

type Key = string | number | null;

/**
 * Интерфейс опций контроллера {@link Controls/search:SearchResolver}
 * @interface Controls/_search/interface/ISearchResolverOptions
 * @public
 * @author Крюков Н.Ю.
 */
export interface ISearchResolverOptions {
   searchDelay?: number | null;
   minSearchLength?: number;
   searchCallback: (value: string) => void;
   searchResetCallback: () => void;

   /**
    * @name Controls/_search/interface/ISearchResolverOptions#searchDelay
    * @cfg {number|null} Время задержки перед поиском
    */

   /**
    * @name Controls/_search/interface/ISearchResolverOptions#minSearchLength
    * @cfg {number} Минимальная длина значения для начала поиска
    */

   /**
    * @name Controls/_search/interface/ISearchResolverOptions#searchCallback
    * @cfg {Function} Функция, которая будет вызвана если поиск будет разрешен
    */

   /**
    * @name Controls/_search/interface/ISearchResolverOptions#searchResetCallback
    * @cfg {Function} Функция, которая будет вызвана если поиск был сброшен
    */
}

/**
 * Интерфейс опций контрола контейнера {@link Controls/search:InputContainer}
 * @interface Controls/_search/interface/ISearchInputContainerOptions
 * @extends UI/Base/IControlOptions
 * @public
 * @author Крюков Н.Ю.
 */
export interface ISearchInputContainerOptions extends IControlOptions {
   searchDelay?: number | null;
   minSearchLength?: number;
   inputSearchValue?: string;
   useStore?: boolean;

   /**
    * @name Controls/_search/interface/ISearchInputContainerOptions#searchDelay
    * @cfg {number|null} Время задержки перед поиском
    * @demo Controls-demo/Search/Explorer
    * @demo Controls-demo/Search/FlatList
    * @demo Controls-demo/Search/TreeView
    */

   /**
    * @name Controls/_search/interface/ISearchInputContainerOptions#minSearchLength
    * @cfg {number} Минимальная длина значения для начала поиска
    * @demo Controls-demo/Search/Explorer
    * @demo Controls-demo/Search/FlatList
    * @demo Controls-demo/Search/TreeView
    */

   /**
    * @name Controls/_search/interface/ISearchInputContainerOptions#inputSearchValue
    * @cfg {string} Значение строки ввода
    * @demo Controls-demo/Search/Explorer
    * @demo Controls-demo/Search/FlatList
    * @demo Controls-demo/Search/TreeView
    */

   /**
    * @name Controls/_search/interface/ISearchInputContainerOptions#useStore
    * @cfg {boolean} Использовать ли хранилище Store вместо отправки события при разрешении на поиск
    * @demo Controls-demo/Search/Explorer
    * @demo Controls-demo/Search/FlatList
    * @demo Controls-demo/Search/TreeView
    */
}

/**
 * Интерфейс опций контроллера поиска {@link Controls/search:ControllerClass}
 * @interface Controls/_search/interface/ISearchControllerOptions
 * @extends Controls/interface/ISearch#ISearchOptions
 * @extends Controls/interface/IHierarchy#IHierarchyOptions
 * @extends Controls/interface/IHierarchy#IHierarchySearchOptions
 * @public
 * @author Крюков Н.Ю.
 * @demo Controls-demo/Search/Explorer
 * @demo Controls-demo/Search/FlatList
 * @demo Controls-demo/Search/TreeView
 */
export interface ISearchControllerOptions extends ISearchOptions,
   IHierarchyOptions,
   IHierarchySearchOptions {
   sourceController?: NewSourceController;
   searchValue?: string;
   root?: Key;
}

/**
 * Интерфейс контроллера поиска {@link Controls/search:ControllerClass}
 * @interface Controls/_search/interface/ISearchController
 * @public
 * @author Крюков Н.Ю.
 * @demo Controls-demo/Search/Explorer
 * @demo Controls-demo/Search/FlatList
 * @demo Controls-demo/Search/TreeView
 */
export interface ISearchController {
   reset(needLoadData?: boolean): Promise<RecordSet | Error> | QueryWhereExpression<unknown>;
   search(value: string): Promise<RecordSet|Error>;
   update(options: Partial<ISearchControllerOptions>): void;
   setRoot(value: Key): void;
   getRoot(): Key;
   getSearchValue(): string;
}

/**
 * Интерфейс контроллера {@link Controls/search:SearchResolver}
 * @interface Controls/_search/interface/ISearchResolver
 * @public
 * @author Крюков Н.Ю.
 */
export interface ISearchResolver {
   resolve(value: string | null): void;
   clearTimer(): void;
}
