import { CollectionItem, IBaseCollection, ICollectionItem, TreeItem } from 'Controls/display';
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
   setSelectedItems(items: Model[], selected: boolean, silent: boolean): void;

   /**
    * Возвращает кол-во элементов в проекции
    * @return {number} кол-во элементов
    */
   getCount(): number;
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
export interface ITreeSelectionStrategyOptions {
   selectAncestors: boolean;
   selectDescendants: boolean;
   nodesSourceControllers?: Map<string, SourceController>;
   hierarchyRelation: relation.Hierarchy;
   rootId: CrudEntityKey;
   entryPath: IEntryPathItem[];
   items: Array<TreeItem<Model>>;
}

/**
 * Интерфейс описывающий опции для плоской стратегии множественного выбора
 *
 * @interface Controls/multiselection/IFlatSelectionStrategyOptions
 * @public
 * @author Панихин К.А.
 */
export interface IFlatSelectionStrategyOptions {
   items: Array<CollectionItem<Model>>;
}

/**
 * Изменения в состоянии выбранных ключей
 * @public
 */
export interface ISelectionDifference {
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
 * Результат метода контроллера множественного выбора
 * @public
 */
export interface ISelectionControllerResult {
   /**
    * Изменения в состоянии выбранных ключей
    * @typedef {ISelectionDifference}
    */
   selectedKeysDiff: ISelectionDifference;

   /**
    * Изменения в состоянии исключенных ключей
    * @typedef {ISelectionDifference}
    */
   excludedKeysDiff: ISelectionDifference;

   /**
    * Кол-во выбранных элементов
    * @typedef {number}
    */
   selectedCount: number;

   /**
    * Выбраны все записи
    * @typedef {boolean}
    */
   isAllSelected: boolean;
}

/**
 * Данные в рекорде
 * Используется чтобы определить состояние узла с незагруженными детьми
 */
export interface IEntryPathItem {
   id: CrudEntityKey;
   parent: CrudEntityKey;
}
