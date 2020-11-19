import { Collection, CollectionItem, IBaseCollection, ICollectionItem, TreeItem } from 'Controls/display';
import { Model, relation } from 'Types/entity';
import { default as ISelectionStrategy } from './SelectionStrategy/ISelectionStrategy';
import { RecordSet } from 'Types/collection';
import { Controller as SourceController } from 'Controls/source';
import { CrudEntityKey } from 'Types/source';

export type TKeys = CrudEntityKey[];

/**
 * Интерфейс описывающий элемент модели, используемой в контроллере множественного выбора
 *
 * @interface Controls/multiselection/ISelectionItem
 * @public
 * @author Аверкиев П.А.
 */
export interface ISelectionItem extends ICollectionItem {
   /**
    * Определяет, можно ли выбрать данный элемент
    */
   SelectableItem: boolean;

   /**
    * Флаг, определяющий состояние правого свайпа по записи.
    * @method
    * @public
    * @return {Boolean} состояние правого свайпа
    */
   isAnimatedForSelection(): boolean;

   /**
    * Флаг, определяющий состояние правого свайпа по записи.
    * @param {Boolean} swiped состояние правого свайпа
    * @method
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
 * @interface Controls/multiselection/ISelectionModel
 * @public
 * @author Панихин К.А.
 */
export interface ISelectionModel extends IBaseCollection<Model, ISelectionItem> {
   /**
    * Проверить, можно ли загрузить еще данные
    *
    * @method
    * @public
    * @return {boolean}
    */
   getHasMoreData(): boolean;

   /**
    * Получить список элементов
    * @method
    * @public
    * @return {RecordSet} список элементов
    */
   getCollection(): RecordSet;

   /**
    * Задать выбранные элементы
    * @method
    * @public
    * @param {Model[]} items Список элементов
    * @param {boolean} selected Состояние переданных элементов
    * @param {Boolean} silent Не уведомлять о изменении
    * @void
    */
   setSelectedItems(items: Array<CollectionItem<Model>>, selected: boolean, silent: boolean): void;

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

/**
 * Интерфейс описывающий опции для контроллера множественного выбора
 *
 * @interface Controls/multiselection/ISelectionControllerOptions
 * @public
 * @author Панихин К.А.
 */
export interface ISelectionControllerOptions {
   model: ISelectionModel;
   selectedKeys: TKeys;
   excludedKeys: TKeys;
   strategy?: ISelectionStrategy;
   strategyOptions?: ITreeSelectionStrategyOptions;
   searchValue?: string;
}

/**
 * Интерфейс описывающий опции для деревянной стратегии множественного выбора
 *
 * @interface Controls/multiselection/ITreeSelectionStrategyOptions
 * @public
 * @author Панихин К.А.
 */
export interface ITreeSelectionStrategyOptions extends IFlatSelectionStrategyOptions {
   selectAncestors: boolean;
   selectDescendants: boolean;
   nodesSourceControllers?: Map<string, SourceController>;
   hierarchyRelation: relation.Hierarchy;
   rootId: CrudEntityKey;
   entryPath: IEntryPathItem[];
}

/**
 * Интерфейс описывающий опции для плоской стратегии множественного выбора
 *
 * @interface Controls/multiselection/IFlatSelectionStrategyOptions
 * @public
 * @author Панихин К.А.
 */
export interface IFlatSelectionStrategyOptions {
   model: ISelectionModel;
}

/**
 * Изменения в списке ключей
 * @interface Controls/multiselection/IKeysDifference
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
 * @interface Controls/multiselection/ISelectionDifference
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
