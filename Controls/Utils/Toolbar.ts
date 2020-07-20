/**
 * Утилита для Toolbar
 *  - содержит константы showType
 *  - фильтр для элементов меню
 *
 * <h3>Пример использования утилиты</h3>
 * <pre>
 * import {showType} from 'Controls/Utils/Toolbar';
 *  .....
 * this._defaultItems = [
 *               {
 *                 id: '1',
 *                 showType: showType.TOOLBAR,
 *                 icon: 'icon-Time icon-medium',
 *                 '@parent': false,
 *                 parent: null
 *                },
 *                {
 *                 id: '3',
 *                 icon: 'icon-Print icon-medium',
 *                 title: 'Распечатать',
 *                 '@parent': false,
 *                 parent: null
 *                 }
 *               };
 * </pre>
 * @class Controls/Utils/Toolbar
 * @public
 */
/**
 * Utils for toolbar
 *  - contains constants showType
 *  - filter for menu items
 *
 * <h3>Usage example</h3>
 * <pre>
 * import {showType} from 'Controls/Utils/Toolbar';
 *  .....
 * this._defaultItems = [
 *               {
 *                 id: '1',
 *                 showType: showType.TOOLBAR,
 *                 icon: 'icon-Time icon-medium',
 *                 '@parent': false,
 *                 parent: null
 *                },
 *                {
 *                 id: '3',
 *                 icon: 'icon-Print icon-medium',
 *                 title: 'Распечатать',
 *                 '@parent': false,
 *                 parent: null
 *                 }
 *               };
 * </pre>
 * @class Controls/Utils/Toolbar
 * @public
 */

import {Abstract as ChainAbstract, factory} from 'Types/chain';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';

export interface IShowType {
   /**
    * Show only in Menu.
    */
   MENU: number;
   /**
    * Show in Menu and Toolbar.
    */
   MENU_TOOLBAR: number;
   /**
    * Show only in Toolbar
    */
   TOOLBAR: number;
}

export enum showType {
   MENU,
   MENU_TOOLBAR,
   TOOLBAR
}

export function getMenuItems<T extends Record>(items: RecordSet<T> | T[]): ChainAbstract<T> {
   return factory(items).filter((item) => {
      return item.get('showType') !== this.showType.TOOLBAR;
   });
}
export function needShowMenu(items: RecordSet): boolean {
    const arrItems = items.getRawData();
    for (let i = 0; i < arrItems.length; i++) {
        if (arrItems[i].showType !== this.showType.TOOLBAR) {
            return true;
        }
    }
    return false;
}
