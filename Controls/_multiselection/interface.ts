import { CollectionItem, IBaseCollection } from 'Controls/display';
import { Model, relation } from 'Types/entity';
import { TKeysSelection as TKeys, TSelectedKey as TKey} from 'Controls/interface';
import { default as ISelectionStrategy } from './SelectionStrategy/ISelectionStrategy';
import { RecordSet } from 'Types/collection';

export interface ISelectionModel extends IBaseCollection<CollectionItem<Model>> {
   getHasMoreData(): boolean;

   getRoot(): CollectionItem<Model>;

   getCollection(): RecordSet;

   setSelectedItems(items: Array<CollectionItem<Model>>, selected: boolean): void;
}

export interface ISelectionControllerOptions {
   model: ISelectionModel;
   selectedKeys: TKeys;
   excludedKeys: TKeys;
   strategy?: ISelectionStrategy;
   strategyOptions?: ITreeSelectionStrategyOptions;
}

export interface ITreeSelectionStrategyOptions {
   selectAncestors: boolean;
   selectDescendants: boolean;
   nodesSourceControllers?: Object;
   hierarchyRelation: relation.Hierarchy;
   rootId: TKey;
   items: RecordSet;
}

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
