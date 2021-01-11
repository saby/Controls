
/**
 * Позволяет настроить, какие опции записи будут показаны по ховеру, а какие - в доп.меню. Влияет на порядок отображения опций записи по свайпу.
 * <pre>
 * import {showType} from 'Controls/toolbars';
 *  .....
 * this._defaultItems = [
 *     {
 *         id: '1',
 *         showType: showType.TOOLBAR,
 *         icon: 'icon-Time icon-medium',
 *         '@parent': false,
 *         parent: null
 *     },
 *     {
 *         id: '3',
 *         icon: 'icon-Print icon-medium',
 *         title: 'Распечатать',
 *         '@parent': false,
 *         parent: null
 *      }
 *  ];
 * </pre>
 * @public
 */
export enum showType {
   /**
    * Элемент отображается только в меню.
    */
   MENU,
   /**
    * Элемент отображается в меню и в тулбаре.
    */
   MENU_TOOLBAR,
   /**
    * Элемент отображается только в тулбаре.
    */
   TOOLBAR
}
