import { CrudEntityKey } from 'Types/source';
import { Model } from 'Types/entity';
import { IDragPosition } from 'Controls/display';
import { IOffset } from '../_scroll/StickyHeader/Utils';

/**
 * Тип позиции, которая указывает куда вставляется элемент относительно элемента, на который навели
 * @type Controls/_listDragNDrop/interface#TPosition
 * @public
 * @author Панихин К.А.
 */
export type TPosition = 'after'|'before'|'on';

/**
 * Интерфейс перетаскиваемого элемента
 * @interface Controls/_listDragNDrop/interface#IDraggableItem
 * @template S Тип содержимого элемента
 * @public
 * @author Панихин К.А.
 */
export interface IDraggableItem<S extends Model = Model> {
   isExpanded(): boolean;
   getContents(): S;
   setDragged(state: boolean): void;
}

/**
 * Интерфейс коллекции с возможностью перетаскивания записей
 * @interface Controls/_listDragNDrop/interface#IDraggableCollection
 * @template P Тип объекта, обозначающего позицию
 * @public
 * @author Панихин К.А.
 */
export interface IDraggableCollection<P = IDragPosition<IDraggableItem>> {
   setDragPosition(position: P): void;
   setDraggedItems(draggableItem: IDraggableItem, draggedItemKeys: CrudEntityKey[]): void;
   resetDraggedItems(): void;
}

/**
 * Интерфейс параметра основного метода стратегии перетаскивания
 * @interface Controls/_listDragNDrop/interface#IDragStrategyParams
 * @template P Тип объекта, обозначающего позицию
 * @template T Тип элемента коллекции
 * @public
 * @author Панихин К.А.
 */
export interface IDragStrategyParams<P, T extends IDraggableItem = IDraggableItem> {
   targetItem: T;
   currentPosition?: P;
   mouseOffsetInTargetItem?: IOffset;
}

/**
 * Интерфейс стратегии перетаскивания
 * @interface Controls/_listDragNDrop/interface#IDragStrategy
 * @template P Тип объекта, обозначающего позицию
 * @public
 * @author Панихин К.А.
 */
export interface IDragStrategy<P> {
   calculatePosition(params: IDragStrategyParams<P>): P;
}

/**
 * Базовый класс стратегии перетаскивания
 * @class Controls/_listDragNDrop/interface#BaseDragStrategy
 * @implements Controls/_listDragNDrop/interface#IDragStrategy
 * @template P Тип объекта, обозначающего позицию
 * @template T Тип элемента коллекции
 * @template C Тип коллекции
 * @public
 * @abstract
 * @author Панихин К.А.
 */
export abstract class BaseDragStrategy<
    P,
    T extends IDraggableItem = IDraggableItem,
    C extends IDraggableCollection<P> = IDraggableCollection<P>,
> implements IDragStrategy<P> {
   protected _draggableItem: T;
   protected _model: C;

   protected constructor(model: C, draggableItem: T) {
      this._model = model;
      this._draggableItem = draggableItem;
   }

   abstract calculatePosition(params: IDragStrategyParams<P>): P;
}
