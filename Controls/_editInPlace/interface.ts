import { IStrategyCollection, IBaseCollection } from 'Controls/display';
import { CollectionItem } from 'Controls/display';

export interface IEditInPlaceItem {
    setEditing(editing: boolean, editingContents?: unknown): void;
    isEditing(): boolean;
}

export interface IEditInPlaceModel
    extends IBaseCollection<IEditInPlaceItem>, IStrategyCollection<IEditInPlaceItem> {
    getEditingConfig(): IEditingConfig;
}

/*
 * @typedef {Object} IEditingConfig
 * @property {Boolean} [editOnClick=false] If true, click on list item starts editing in place.
 * @property {Boolean} [autoAdd=false] If true, after the end of editing of the last list item, new item adds automatically and its editing begins.
 * @property {Boolean} [sequentialEditing=true] If true, after the end of editing of any list item other than the last, editing of the next list item starts automatically.
 * @property {Boolean} [toolbarVisibility=false] Determines whether buttons 'Save' and 'Cancel' should be displayed.
 * @property {AddPosition} [addPosition] Editing in place position.
 * @property {Types/entity:Record} [item=undefined] If present, editing of this item will begin on first render.
 */
export interface IEditingConfig {
    addPosition?: 'top'|'bottom';
    toolbarVisibility?: boolean;
    editOnClick?: boolean;
    autoAdd?: boolean;
    sequentialEditing?: boolean;
    item?: CollectionItem<any>;
}

export interface IOptions {
    model: IEditInPlaceModel;
}