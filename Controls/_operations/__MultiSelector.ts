import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operations/__MultiSelector';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TKeySelection as TKey, TKeysSelection as TKeys} from 'Controls/interface/';

const DEFAULT_ITEMS = [
   {
      id: 'selectAll',
      title: rk('Все')
   }, {
      id: 'unselectAll',
      title: rk('Снять')
   }, {
      id: 'toggleAll',
      title: rk('Инвертировать')
   }
];

const SHOW_SELECTED_ITEM =  {
   id: 'selected',
   title: rk('Показать отмеченнные')
};

const SHOW_ALL_ITEM =  {
   id: 'all',
   title: rk('Показать все')
};

type TCount = void|number;

export interface IMultiSelectorOptions extends IControlOptions {
   selectedKeys: TKeys;
   excludedKeys: TKeys;
   selectedKeysCount: TCount;
   isAllSelected: boolean;
}

export default class MultiSelector extends Control<IMultiSelectorOptions> {
   protected _template: TemplateFunction = template;
   protected _menuSource: Memory = null;
   protected _sizeChanged: boolean = false;
   protected _menuCaption: string = null;

   protected _beforeMount(options: IMultiSelectorOptions): void {
      this._menuSource = this._getMenuSource(options);
      this._updateSelection(options.selectedKeys, options.excludedKeys, options.selectedKeysCount, options.isAllSelected);
   }

   protected _beforeUpdate(options: IMultiSelectorOptions): void {
      const currOpts = this._options;
      const selectionIsChanged = currOpts.selectedKeys !== options.selectedKeys || currOpts.excludedKeys !== options.excludedKeys;

      if (selectionIsChanged || currOpts.selectedKeysCount !== options.selectedKeysCount || currOpts.isAllSelected !== options.isAllSelected) {
         this._updateSelection(options.selectedKeys, options.excludedKeys, options.selectedKeysCount, options.isAllSelected);
      }

      if (selectionIsChanged || currOpts.selectionViewMode !== options.selectionViewMode) {
         this._menuSource = this._getMenuSource(options);
      }
   }

   protected _afterUpdate(oldOptions?: IMultiSelectorOptions): void {
      if (this._sizeChanged) {
         this._sizeChanged = false;
         this._notify('controlResize', [], { bubbling: true });
      }
   }

   private _getAdditionalMenuItems(options: IMultiSelectorOptions): Array<Object> {
      let additionalItems: Array<Object> = [];

      if (options.selectionViewMode === 'selected') {
         additionalItems.push(SHOW_ALL_ITEM);
         // Показываем кнопку если есть выбранные и невыбранные записи
      } else if (options.selectionViewMode === 'all' && options.selectedKeys.length && !options.isAllSelected) {
         additionalItems.push(SHOW_SELECTED_ITEM);
      }

      return additionalItems;
   }

   private _getMenuSource(options: IMultiSelectorOptions): Memory {
      return new Memory({
         keyProperty: 'id',
         data: DEFAULT_ITEMS.concat(this._getAdditionalMenuItems(options))
      });
   }

   private _updateSelection(selectedKeys: TKeys, excludedKeys: TKeys, count: TCount, isAllSelected: TKey): void {
      const selectedCount = count === undefined ? selectedKeys.length : count;

      if (selectedCount > 0 && selectedKeys.length) {
         this._menuCaption = rk('Отмечено') + ': ' + selectedCount;
      } else if (isAllSelected) {
         this._menuCaption = rk('Отмечено всё');
      } else if (selectedCount === null) {
         this._menuCaption = rk('Отмечено');
      } else {
         this._menuCaption = rk('Отметить');
      }
      this._sizeChanged = true;
   }

   protected _onMenuItemActivate(event: SyntheticEvent<'menuItemActivate'>, item: Model): void {
      let itemId: string = item.get('id');

      this._notify('selectedTypeChanged', [itemId], {
         bubbling: true
      });
   }

   static getDefaultOptions(): object {
      return {
         selectedKeys: [],
         excludedKeys: []
      };
   }
}
