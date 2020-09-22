import { Collection, CollectionItem } from 'Controls/display';
import { Model } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';

export type TVisibility = 'visible' | 'hidden' | 'onactivated';
export enum Visibility { Visible = 'visible', Hidden = 'hidden', OnActivated = 'onactivated'}

/**
 * Опции контроллера
 * @interface Controls/_marker/IOptions
 * @public
 * @author Панихин К.А.
 */
export interface IOptions extends IMarkerListOptions {
   model: Collection<Model, CollectionItem<Model>>;
}

/**
 * Опции для маркера списка
 * @interface Controls/_marker/interface/IMarkerListOptions
 * @public
 * @author Панихин К.А.
 */
export interface IMarkerListOptions {
   /**
    * @typedef {String} TVisibility
    * @variant visible Маркер отображается всегда, даже если не задан идентификатор элемента в опции {@link markedKey}.
    * @variant hidden Маркер всегда скрыт.
    * @variant onactivated Макер отображается при активации списка, например при клике по элементу.
    */

   /**
    * @name Controls/_marker/interface/IMarkerListOptions#markerVisibility
    * @cfg {TVisibility} Режим отображения маркера активного элемента.
    * @remark
    * В следующем примере маркер появляется только при активации списка.
    * @demo Controls-demo/list_new/Marker/OnActivated/Index
    * @default onactivated
    * @see markedKey
    */

   /*ENG
    * @name Controls/_marker/interface/IMarkerListOptions#markerVisibility
    * @cfg {String} Determines when marker is visible.
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
    * @variant visible The marker is always displayed, even if the marked key entry is not specified.
    * @variant hidden The marker is always hidden.
    * @variant onactivated - The marker is displayed on List activating. For example, when user mark a record.
    * @default onactivated
    */
   markerVisibility?: TVisibility;

   /**
    * @name Controls/_marker/interface/IMarkerListOptions#markedKey
    * @cfg {CrudEntityKey} Идентификатор элемента, который выделен маркером.
    * @demo Controls-demo/List/List/BasePG
    * @see markerVisibility
    */

   /*ENG
    * @name Controls/_marker/interface/IMarkerListOptions#markedKey
    * @cfg {Number} Identifier of the marked collection item.
    * @remark
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FBasePG">Example</a>.
    */
   markedKey?: CrudEntityKey;
}
