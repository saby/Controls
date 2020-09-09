import { SyntheticEvent } from 'Vdom/Vdom';
import { CollectionItem, TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';

export type TPosition = 'after'|'before'|'on'
export type TKey = number|string

export interface IDragPosition {
   index: number;
   position: TPosition;
   item: object; // TODO dnd указать тип
   data: object;
}

export interface ISelection {
   selected: Array<TKey|null>;
   excluded: Array<TKey|null>;
   recursive?: boolean;
}

export interface IFlatModel {
   setDraggedItems(avatarItem, draggedItems): void;
   setAvatarPosition(position: IDragPosition): void;
   resetDraggedItems(): void;

   calculateDragTargetPosition(itemData): IDragPosition;
   getItemDataByItem(item);

   getIndexByKey(key: number|string): number;
}

export interface ITreeModel extends IFlatModel {
   getPrevDragTargetPosition(): IDragPosition;

   getExpandedItems(): Array<object>;
}

export interface IFlatController {
   update(model: IFlatModel, canStartDragNDropOption: boolean|Function): void;

   setDraggedItems(avatarItem: IFlatItem, draggedItems: Array<TKey>): void;

   canStartDragNDrop(event: SyntheticEvent<MouseEvent>, isTouch: boolean): boolean;

   startDragNDrop(): void;

   setAvatarPosition(newPosition: IDragPosition): void;

   getCurrentDragPosition(): IDragPosition;

   calculateDragPosition(itemData: IFlatItem): IDragPosition;

   getSelectionForDragNDrop(selectedKeys: Array<TKey|null>, excludedKeys: Array<TKey|null>, dragKey: TKey): ISelection;

   isDragging(): boolean;

   reset(): void;
}

export interface ITreeController extends IFlatController {
   getPositionRelativeNode(itemData: ITreeItem, event: SyntheticEvent<MouseEvent>): IDragPosition;

   startCountDownForExpandNode(itemData: ITreeItem, expandNode: Function): void;

   stopCountDownForExpandNode(): void;
}

export interface IFlatItem {
   index: number;
   item: Model;
   key: TKey;
   dispItem: CollectionItem<Model>;
}

export interface ITreeItem extends IFlatItem {
   dispItem: TreeItem<Model>;
   nodeProperty: string;
   isExpanded: boolean;
}