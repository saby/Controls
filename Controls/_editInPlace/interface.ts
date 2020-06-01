import { IStrategyCollection, IBaseCollection, IEditingConfig } from 'Controls/display';
import { CollectionItem } from 'Controls/display';

export interface IEditInPlaceItem {
    setEditing(editing: boolean, editingContents?: unknown): void;
    isEditing(): boolean;
}

export interface IEditInPlaceModel
    extends IBaseCollection<IEditInPlaceItem>, IStrategyCollection<IEditInPlaceItem> {
    getEditingConfig(): IEditingConfig;
}
