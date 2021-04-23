import { DestroyableMixin, Model, ObservableMixin } from 'Types/entity';
import {IEnumerable} from '../Abstract';
import {IBaseCollection} from 'Controls/_display/interface';
import {ICollectionItem} from 'Controls/_display/interface/ICollectionItem';

export interface ISourceCollection<T extends Model = Model> extends IEnumerable<T>, DestroyableMixin, ObservableMixin {
    getCount(): number;

    at(i: number): T;
}

/**
 * @typedef {String} TVerticalItemPadding
 * @variant S
 * @variant nyll
 */
export type TVerticalItemPadding = 'S'|'null';

/**
 * @typedef {String} THorizontalItemPadding
 * @variant XS
 * @variant S
 * @variant M
 * @variant L
 * @variant XL
 * @variant XXL
 * @variant null
 */
export type THorizontalItemPadding = 'XS'|'S'|'M'|'L'|'XL'|'XXL'|'null';

/**
 * Интерфейс настройки отступов записи
 * @Interface Controls/_display/interface/ICollection/IItemPadding
 * @public
 * @author Авраменко А.С.
 */
/*ENG
 * Item padding settings interface
 * @Interface Controls/_display/interface/ICollection/IItemPadding
 * @public
 * @author Авраменко А.С.
 */
export interface IItemPadding {
    /**
     * @name Controls/_display/interface/ICollection/IItemPadding#top
     * @cfg {TVerticalItemPadding} Отступ записи сверху
     */
    top?: TVerticalItemPadding;
    /**
     * @name Controls/_display/interface/ICollection/IItemPadding#bottom
     * @cfg {TVerticalItemPadding} Отступ записи снизу
     */
    bottom?: TVerticalItemPadding;
    /**
     * @name Controls/_display/interface/ICollection/IItemPadding#left
     * @cfg {THorizontalItemPadding} Отступ записи слева
     */
    left?: THorizontalItemPadding;
    /**
     * @name Controls/_display/interface/ICollection/IItemPadding#right
     * @cfg {THorizontalItemPadding} Отступ записи справа
     */
    right?: THorizontalItemPadding;
}

/*
 * @typedef {Enum} ANIMATION_STATE
 * @description Состояние анимации свайпа
 * @variant open Открывается ItemActions по свайпу
 * @variant close Закрывается ItemActions по свайпу
 * @variant right-swipe Элемент свайпнут вправо.
 */
/*
 * @typedef {Enum} ANIMATION_STATE
 * @variant open ItemActions are opening
 * @variant close ItemActions are closing
 * @variant right-swipe item has been swiped rights
 */
export enum ANIMATION_STATE {
    CLOSE = 'close',
    OPEN = 'open',
    RIGHT_SWIPE = 'right-swipe'
}

/*
 * Интерфейс коллекции, по которому CollectionItem обращается к Collection
 *
 * @interface Controls/_display/interface/ICollection
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Collection interface to call Collection methods from CollectionItem
 *
 * @interface Controls/_display/interface/ICollection
 * @private
 * @author Аверкиев П.А.
 */
export interface ICollection<S extends Model, T extends ICollectionItem> extends IBaseCollection<S, T> {
    getCollection(): ISourceCollection<S>;
    getDisplayProperty(): string;
    getMultiSelectVisibility(): string;
    getMultiSelectPosition(): 'default' | 'custom';
    getTopPadding(): string;
    getBottomPadding(): string;
    getRightPadding(): string;
    getLeftPadding(): string;
    getStyle(): string;
    getItemUid(item: T): string;
    getMarkerVisibility(): string;
    getRowSeparatorSize(): string;
    getItemsDragNDrop(): boolean;
    notifyItemChange(item: T, properties?: object): void;
    getEditingBackgroundStyle(): string;
}
