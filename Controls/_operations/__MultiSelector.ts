import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operations/__MultiSelector';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TKeysSelection, ISelectionObject} from 'Controls/interface';
import {default as getCountUtil, IGetCountCallParams} from 'Controls/_operations/MultiSelector/getCount';

const DEFAULT_CAPTION = rk('Отметить');
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
   title: rk('Показать отмеченные')
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

   protected _beforeUpdate(newOptions: IMultiSelectorOptions): void|Promise<TCount> {
      const options = this._options;
      const selectionIsChanged = options.selectedKeys !== newOptions.selectedKeys ||
                                 options.excludedKeys !== newOptions.excludedKeys;
      const viewModeChanged = options.selectionViewMode !== newOptions.selectionViewMode;
      const isAllSelectedChanged = options.isAllSelected !== newOptions.isAllSelected;
      const selectionCfgChanged = options.selectedCountConfig !== newOptions.selectedCountConfig;
      const selectionCountChanged = options.selectedKeysCount !== newOptions.selectedKeysCount;

      if (selectionIsChanged || viewModeChanged || isAllSelectedChanged || selectionCfgChanged) {
         this._menuSource = this._getMenuSource(newOptions);
      }

      if (selectionIsChanged || selectionCountChanged || isAllSelectedChanged || selectionCfgChanged) {
         return this._updateMenuCaptionByOptions(newOptions, selectionCfgChanged);
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

   private _updateMenuCaptionByOptions(options: IMultiSelectorOptions, counterConfigChanged: boolean): Promise<TCount> {
      const selectedKeys = options.selectedKeys;
      const excludedKeys = options.excludedKeys;
      const selection = this._getSelection(selectedKeys, excludedKeys);
      const count = counterConfigChanged ? null : options.selectedKeysCount;
      const getCountCallback = (count) => {
         this._menuCaption = this._getMenuCaption(selection, count, options.isAllSelected);
         this._sizeChanged = true;
      };
      const getCountResult = this._getCount(selection, count, options.selectedCountConfig);

      // Если счётчик удаётся посчитать без вызова метода, то надо это делать синхронно,
      // иначе promise порождает асинхронность и перестроение панели операций будет происходить скачками,
      // хотя можно было это сделать за одну синхронизацию
      if (getCountResult instanceof Promise) {
         return getCountResult.then(getCountCallback);
      } else {
         getCountCallback(getCountResult);
      }
   }

   private _getMenuCaption({selected, excluded}: ISelectionObject, count: TCount, isAllSelected: boolean): string {
      const hasSelected = !!selected.length;
      let caption;

      if (hasSelected) {
         if (count > 0) {
            caption = rk('Отмечено') + ': ' + count;
         } else if (isAllSelected) {
            caption = rk('Отмечено все');
         } else if (count === null) {
            caption = rk('Отмечено');
         } else {
            caption = DEFAULT_CAPTION;
         }
      } else {
         caption = DEFAULT_CAPTION;
      }

      return caption;
   }

   private _getCount(
       selection: ISelectionObject,
       count: TCount,
       selectionCountConfig: IGetCountCallParams
   ): Promise<TCount>|TCount {
      let countResult;
      if (!this._options.selectedCountConfig || this._isCorrectCount(count)) {
         countResult = count === undefined ? selection.selected.length : count;
      } else {
         this._children.countIndicator.show();
         countResult = getCountUtil.getCount(selection, selectionCountConfig).then((result: number): number => {
            if (this._children.countIndicator) {
               this._children.countIndicator.hide();
            }
            return result;
         });
      }
      return countResult;
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
