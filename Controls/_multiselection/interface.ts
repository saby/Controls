import { Collection, CollectionItem, IBaseCollection, ICollectionItem, TreeItem } from 'Controls/display';
import { Model, relation } from 'Types/entity';
import { default as ISelectionStrategy } from './SelectionStrategy/ISelectionStrategy';
import { RecordSet } from 'Types/collection';
import { NewSourceController as SourceController } from 'Controls/dataSource';
import { CrudEntityKey } from 'Types/source';

export type TKeys = CrudEntityKey[];

/**
 * Интерфейс описывающий элемент модели, используемой в контроллере множественного выбора
 *
 * @interface Controls/_multiselection/ISelectionItem
 * @public
 * @author Аверкиев П.А.
 */
export interface ISelectionItem extends ICollectionItem {
   /**
    * Определяет, можно ли выбрать данный элемент
    */
   SelectableItem: boolean;

   /**
    * Определяет, запрещено ли изменение состояния чекбокса
    * @return {Boolean}
    */
   isReadonlyCheckbox(): boolean;

   /**
    * Флаг, определяющий состояние правого свайпа по записи.
    * @function
    * @public
    * @return {Boolean} состояние правого свайпа
    */
   isAnimatedForSelection(): boolean;

   /**
    * Флаг, определяющий состояние правого свайпа по записи.
    * @param {Boolean} swiped состояние правого свайпа
    * @function
    * @public
    */
   setAnimatedForSelection(swiped: boolean): boolean;

   /**
    * Определяет состояние выбранности элемента
    * @return {boolean|null} состояние выбранности элемента
    */
   isSelected(): boolean|null;
}

/**
 * Интерфейс модели, используемой в контроллере множественного выбора
 *
 * @interface Controls/_multiselection/ISelectionModel
 * @public
 * @author Панихин К.А.
 */
export interface ISelectionModel extends IBaseCollection<Model, ISelectionItem> {
   /**
    * Проверить, можно ли загрузить еще данные
    *
    * @function
    * @public
    * @return {boolean}
    */
   hasMoreData(): boolean;

   /**
    * Получить список элементов
    * @function
    * @public
    * @return {RecordSet} список элементов
    */
   getCollection(): RecordSet;

   /**
    * Возвращает кол-во элементов в проекции
    * @return {number} кол-во элементов
    */
   getCount(): number;

   /**
    * Возвращает список элементов
    * @return {ISelectionItem[]} список элементов
    */
   getItems(): ISelectionItem[];
}

export interface ISelectionControllerOptions {
   filter: any;
   model: ISelectionModel;
   selectedKeys: TKeys;
   excludedKeys: TKeys;
   strategy?: ISelectionStrategy;
   strategyOptions?: ITreeSelectionStrategyOptions;
   searchValue?: string;
}

export interface ITreeSelectionStrategyOptions extends IFlatSelectionStrategyOptions {
   selectAncestors: boolean;
   selectDescendants: boolean;
   hierarchyRelation: relation.Hierarchy;
   rootId: CrudEntityKey;
   entryPath: IEntryPathItem[];
   selectionType: 'node'|'leaf'|'all';
   recursiveSelection: boolean;
}

export interface IFlatSelectionStrategyOptions {
   model: ISelectionModel;
}

/**
 * Изменения в списке ключей
 * @interface Controls/_multiselection/IKeysDifference
 * @public
 * @author Панихин К.А.
 */
export interface IKeysDifference {
   /**
    * Список ключей
    * @typedef {TKeys}
    */
   keys: TKeys;

   /**
    * Список добавленных ключей
    * @typedef {TKeys}
    */
   added: TKeys;

   /**
    * Список удаленных ключей
    * @typedef {TKeys}
    */
   removed: TKeys;
}

/**
 * Изменения в выбранных элементах
 * @interface Controls/_multiselection/ISelectionDifference
 * @public
 * @author Панихин К.А.
 */
export interface ISelectionDifference {
   selectedKeysDifference: IKeysDifference;
   excludedKeysDifference: IKeysDifference;
}

/**
 * Данные в рекорде
 * Используется чтобы определить состояние узла с незагруженными детьми
 */
export interface IEntryPathItem {
   id: CrudEntityKey;
   parent: CrudEntityKey;
}

/**
 * Интерфейс описывающий опции для плоской стратегии множественного выбора
 *
 * @interface Controls/_multiselection/IFlatSelectionStrategy
 * @public
 * @author Панихин К.А.
 */

/**
 * Интерфейс описывающий опции для контроллера множественного выбора
 *
 * @interface Controls/_multiselection/ISelectionController
 * @public
 * @author Панихин К.А.
 */

/**
 * Интерфейс описывающий опции для деревянной стратегии множественного выбора
 *
 * @interface Controls/_multiselection/ITreeSelectionStrategy
 * @public
 * @author Панихин К.А.
 */