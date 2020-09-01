import { CollectionItem, IBaseCollection, ICollectionItem } from 'Controls/display';
import { Model, relation } from 'Types/entity';
import { TKeysSelection as TKeys, TSelectedKey as TKey} from 'Controls/interface';
import { default as ISelectionStrategy } from './SelectionStrategy/ISelectionStrategy';
import { RecordSet } from 'Types/collection';
import { Controller as SourceController } from 'Controls/source';

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
 * Интерфейс описывающий модель, используемую в контроллере множественного выбора
 *
 * @interface Controls/multiselection/ISelectionModel
 * @public
 * @author Панихин К.А.
 */
export interface ISelectionModel extends IBaseCollection<ISelectionItem> {
   /**
    * Проверить, можно ли загрузить еще данные
    *
    * @method
    * @public
    * @return {boolean}
    */
   getHasMoreData(): boolean;

   /**
    * Получить текущий корневой элемент
    * @remark
    * Верхним корневым элементом является null
    * В плоской стратегии корневой элемент всегда null
    * @method
    * @public
    * @return {CollectionItem<Model>} Данные корнего элемента
    */
   getRoot(): CollectionItem<Model>;

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
   rootId: TKey;
   items: RecordSet;
}

/**
 * Интерфейс описывающий опции для плоской стратегии множественного выбора
 *
 * @interface Controls/multiselection/IFlatSelectionStrategyOptions
 * @public
 * @author Панихин К.А.
 */
export interface IFlatSelectionStrategyOptions {
   items: RecordSet;
}

/**
 * Изменения в состоянии выбранных ключей
 */
export interface ISelectionDifference {
   keys: TKeys;
   added: TKeys;
   removed: TKeys;
}

/**
 * Результат метода SelectionController-а
 */
export interface ISelectionControllerResult {
   selectedKeysDiff: ISelectionDifference;
   excludedKeysDiff: ISelectionDifference;
   selectedCount: number;
   isAllSelected: boolean;
}

/**
 * Данные в рекорде
 * Используется чтобы определить состояние узла с незагруженными детьми
 */
export interface IEntryPath {
   id: TKey;
   parent: TKey;
}
