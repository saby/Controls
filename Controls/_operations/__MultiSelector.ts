import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operations/__MultiSelector';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TKeysSelection, ISelectionObject} from 'Controls/interface';
import {default as getCountUtil, IGetCountCallParams} from 'Controls/_operations/MultiSelector/getCount';

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

type TCount = null|number|void;

export interface IMultiSelectorOptions extends IControlOptions {
   selectedKeys: TKeysSelection;
   excludedKeys: TKeysSelection;
   selectedKeysCount: TCount;
   isAllSelected?: boolean;
   selectionViewMode?: 'all'|'selected';
   selectedCountConfig?: IGetCountCallParams;
}

export default class MultiSelector extends Control<IMultiSelectorOptions> {
   protected _template: TemplateFunction = template;
   protected _menuSource: Memory = null;
   protected _sizeChanged: boolean = false;
   protected _menuCaption: string = null;

   protected _beforeMount(options: IMultiSelectorOptions): Promise<TCount> {
      this._menuSource = this._getMenuSource(options);
      return this._updateMenuCaptionByOptions(options);
   }

   protected _beforeUpdate(options: IMultiSelectorOptions): void|Promise<TCount> {
      const currOpts = this._options;
      const selectionIsChanged = currOpts.selectedKeys !== options.selectedKeys || currOpts.excludedKeys !== options.excludedKeys;

      if (selectionIsChanged || currOpts.selectionViewMode !== options.selectionViewMode) {
         this._menuSource = this._getMenuSource(options);
      }

      if (selectionIsChanged || currOpts.selectedKeysCount !== options.selectedKeysCount) {
         return this._updateMenuCaptionByOptions(options);
      }
   }

   protected _afterUpdate(oldOptions?: IMultiSelectorOptions): void {
      if (this._sizeChanged) {
         this._sizeChanged = false;
         this._notify('controlResize', [], { bubbling: true });
      }
   }

   private _getAdditionalMenuItems(options: IMultiSelectorOptions): object[] {
      const additionalItems = [];

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

   private _updateMenuCaptionByOptions(options: IMultiSelectorOptions): Promise<TCount> {
      const selectedKeys = options.selectedKeys;
      const excludedKeys = options.excludedKeys;
      const selection = this._getSelection(selectedKeys, excludedKeys);

      return this._getCount(selection, options.selectedKeysCount).then((countResult) => {
         this._menuCaption = this._getMenuCaption(selection, countResult, options.isAllSelected);
         this._sizeChanged = true;
      });
   }

   private _getMenuCaption({selected, excluded}: ISelectionObject, count: TCount, isAllSelected: boolean): string {
      let caption;

      if (count > 0 && selected.length) {
         caption = rk('Отмечено') + ': ' + count;
      } else if (isAllSelected) {
         caption = rk('Отмечено всё');
      } else if (count === null) {
         caption = rk('Отмечено');
      } else {
         caption = rk('Отметить');
      }

      return caption;
   }

   private _getCount(selection: ISelectionObject, count: TCount): Promise<TCount> {
      let methodResult;
      let countResult;

      if (this._isCorrectCount(count) || !this._options.selectedCountConfig) {
         countResult = count === undefined ? selection.selected.length : count;
         methodResult = Promise.resolve(countResult);
      } else {
         this._children.countIndicator.show();
         methodResult = getCountUtil.getCount(selection, this._options.selectedCountConfig).then((count) => {
            this._children.countIndicator.hide();
            return count;
         });
      }

      return methodResult;
   }

   private _getSelection(selectedKeys: TKeysSelection, excludedKeys: TKeysSelection): ISelectionObject {
      return {
         selected: selectedKeys,
         excluded: excludedKeys
      };
   }

   private _isCorrectCount(count: TCount): boolean {
      return typeof count === 'number' || count === undefined;
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
