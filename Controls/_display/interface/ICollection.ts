import {DestroyableMixin, ObservableMixin} from "Types/entity";
import {IEnumerable} from "../Abstract";
import {IBaseCollection} from "../interface";

export interface ISourceCollection<T> extends IEnumerable<T>, DestroyableMixin, ObservableMixin {
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
export interface ICollection<S, T> extends IBaseCollection<T> {
    getCollection(): ISourceCollection<S>;
    getDisplayProperty(): string;
    getMultiSelectVisibility(): string;
    getTopPadding(): string;
    getBottomPadding(): string;
    getRightPadding(): string;
    getLeftPadding(): string;
    getItemUid(item: T): string;
    getMarkerVisibility(): string;
    notifyItemChange(item: T, properties?: object): void;
}
