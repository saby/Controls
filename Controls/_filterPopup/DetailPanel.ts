import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPopup/Panel/Panel';
import chain = require('Types/chain');
import Utils = require('Types/util');
import Clone = require('Core/core-clone');
import find = require('Core/helpers/Object/find');
import {isEqual} from 'Types/object';
import {factory, List, RecordSet} from 'Types/collection';
import {HistoryUtils, FilterUtils, IFilterItem} from 'Controls/filter';
import {Controller, IValidateResult} from 'Controls/validate';
import 'Controls/form';
import {IFilterDetailPanelOptions, THistorySaveMode} from 'Controls/_filterPopup/interface/IFilterPanel';
import 'css!Controls/filterPopup';

const getPropValue = Utils.object.getPropertyValue.bind(Utils);
const setPropValue = Utils.object.setPropertyValue.bind(Utils);

/**
 * Контрол для отображения шаблона панели фильтров. Отображает каждый фильтр по заданным шаблонам.
 * Он состоит из трех блоков: Отбираются, Еще можно отобрать, Ранее отбирались.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter/filter-view/base-settings/#step-3 руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_filter.less переменные тем оформления filter}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_filterPopup.less переменные тем оформления filterPopup}
 *
 * @class Controls/_filterPopup/DetailPanel
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:IFilterButton
 * @public
 * @author Михайлов С.Е.
 *
 * @demo Controls-demo/Filter_new/DetailPanel/ApplyButtonCaption/Index
 *
 * @cssModifier controls-FilterPanel__width-s Маленькая ширина панели.
 * @cssModifier controls-FilterPanel__width-m Средняя ширина панели.
 * @cssModifier controls-FilterPanel__width-l Большая ширина панели.
 * @cssModifier controls-FilterPanel__width-xl Очень большая ширина панели.
 * @cssModifier controls-FilterPanel__DateRange Кастомизирует контрол DateRange для отображения на панели фильтров.
 * Необходимо навесить на шаблон фильтра DateRange.
 */

/*
 * Component for displaying a filter panel template. Displays each filters by specified templates.
 * It consists of three blocks: Selected, Also possible to select, Previously selected.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FFilter%2FButton%2FPanelVDom">demo-example</a>.
 *
 *
 * @class Controls/_filterPopup/DetailPanel
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:IFilterButton
 * @demo Controls-demo/Filter_new/DetailPanel/ApplyButtonCaption/Index
 * @public
 * @author Михайлов С.Е.
 *
 * @cssModifier controls-FilterPanel__width-s Маленькая ширина панели.
 * @cssModifier controls-FilterPanel__width-m Средняя ширина панели.
 * @cssModifier controls-FilterPanel__width-l Большая ширина панели.
 * @cssModifier controls-FilterPanel__width-xl Очень большая ширина панели.
 */
class FilterPanel extends Control<IFilterDetailPanelOptions, RecordSet | List<IFilterItem[]>> {
   protected _template: TemplateFunction = template;
   protected _isChanged: boolean = false;
   protected _hasResetValue: boolean = false;
   protected _hasAdditionalParams: boolean = false;
   protected _hasHistory: boolean = false;
   protected _keyProperty: string = null;
   protected _historySaveMode: THistorySaveMode = null;
   protected _items: IFilterItem[];
   protected _historyItems: RecordSet | List<IFilterItem[]>;
   protected _historyId: string;

   protected _children: {
      formController: Controller;
   };

   protected _beforeMount(options: IFilterDetailPanelOptions): Promise<RecordSet | List<IFilterItem[]>> {
      this._resolveItems(options);
      this._hasAdditionalParams = this._hasAddParams(options);
      this._keyProperty = this._getKeyProperty(this._items);
      this._isChanged = this._isChangedValue(this._items);
      this._hasResetValue = FilterUtils.hasResetValue(this._items);
      this._historySaveMode = options.orientation === 'horizontal' || options.historySaveMode === 'favorite' ? 'favorite' : 'pinned';
      return this._loadHistoryItems(options.historyId, this._historySaveMode);
   }

   protected _beforeUpdate(newOptions: IFilterDetailPanelOptions): void | Promise<RecordSet | List<IFilterItem[]>> {
      if (!isEqual(this._options.items, newOptions.items)) {
         this._resolveItems(newOptions);
      }
      this._keyProperty = this._getKeyProperty(this._items);
      this._isChanged = this._isChangedValue(this._items);
      this._hasAdditionalParams = this._hasAddParams(newOptions);
      this._hasResetValue = FilterUtils.hasResetValue(this._items);
      if (this._options.historyId !== newOptions.historyId) {
         return this._loadHistoryItems(newOptions.historyId, this._historySaveMode);
      }
   }

   protected _historyItemsChanged(): void {
      this._reloadHistoryItems(this._options.historyId);
   }

   protected _itemsChangedHandler(event: Event, items: IFilterItem[]): void {
      this._items = this._cloneItems(items);
      this._notify('itemsChanged', [this._items]);
   }

   protected _applyHistoryFilter(event: Event, history: IFilterItem[]): void {
      const items = history.items || history;
      this._applyFilter(event, items, history);
   }

   protected _applyFilter(event: Event, items: IFilterItem[], history: IFilterItem[]): void {
      const curItems = items || this._items;

      const apply = (preparedItems) => {
         /*
            Due to the fact that a bar can be created as you like (the bar will be not in the root, but a bit deeper)
            and the popup captures the sendResult operation from the root node, bubbling must be set in true.
         */
         this._notify('sendResult', [{
            filter: this._getFilter(preparedItems),
            items: preparedItems,
            history
         }], {bubbling: true});
         this._notify('close', [], {bubbling: true});
      };

      if (history) {
         this._notify('historyApply', [curItems]);
         apply(curItems);
      } else {
         this._validate().then((result: IValidateResult) => {
            if (this._isPassedValidation(result)) {
               apply(this._prepareItems(curItems));
            }
         });
      }
   }

   protected _resetFilter(): void {
      this._items = this._cloneItems(this._options.items);
      FilterUtils.resetFilter(this._items);
      this._isChanged = false;
      this._notify('itemsChanged', [this._items]);
   }

   private _hasAddParams(options: IFilterDetailPanelOptions): boolean {
      let hasAdditional = false;
      if (options.additionalTemplate || options.additionalTemplateProperty) {
         chain.factory(this._items).each((item) => {
            if (getPropValue(item, 'visibility') === false) {
               hasAdditional = true;
            }
         });
      }

      return hasAdditional;
   }

   private _resolveItems(options: IFilterDetailPanelOptions): void {
      if (options.items) {
         this._items = this._cloneItems(options.items);
      } else {
         throw new Error('Controls/filterPopup:Panel::items option is required');
      }
   }
   /**
    * Для совместимости старой и новой панелей, пока не откажемся от filter:Button и поля id в структуре.
    * @param item
    */
   private _getItemName(item: IFilterItem): string {
      return item.name || item.id;
   }

   private _loadHistoryItems(historyId: string, historySaveMode: THistorySaveMode) {
      const isFavoriteHistory = historySaveMode === 'favorite';
      if (historyId) {
         const config = {
            historyId,
            recent: isFavoriteHistory ? 'MAX_HISTORY_REPORTS' : 'MAX_HISTORY',
            favorite: isFavoriteHistory
         };
         return HistoryUtils.loadHistoryItems(config).then(
             (items) => {
               const historySource = HistoryUtils.getHistorySource(config);
               let historyItems;

               if (isFavoriteHistory) {
                  historyItems = historySource.getItems();
               } else {
                   historyItems = items;
               }
               this._historyItems = this._filterHistoryItems(historyItems);
               this._hasHistory = !!this._historyItems.getCount();
               return this._historyItems;
            }, () => {
               this._historyItems = new List({ items: [] });
            });
      }
   }

   private _filterHistoryItems(items: RecordSet): RecordSet {
      const getOriginalItem = (historyItem: IFilterItem): IFilterItem => {
         return find(this._items, (origItem) => {
            return this._getItemName(origItem) === this._getItemName(historyItem);
         });
      };

      let result;
      let originalItem;
      let hasResetValue;

      if (items) {
         result = chain.factory(items).filter((item) => {
            let validResult = false;

            const objectData = JSON.parse(item.get('ObjectData'));
            if (objectData) {
               const history = objectData.items || objectData;

               for (let i = 0, length = history.length; i < length; i++) {
                  const textValue = getPropValue(history[i], 'textValue');
                  const value = getPropValue(history[i], 'value');

                  // 0 and false is valid
                  if (textValue !== '' && textValue !== undefined && textValue !== null) {
                     originalItem = getOriginalItem(history[i]);
                     hasResetValue = originalItem && originalItem.hasOwnProperty('resetValue');

                     if (!hasResetValue || hasResetValue && !isEqual(value, getPropValue(originalItem, 'resetValue'))) {
                        validResult = true;
                        break;
                     }
                  }
               }
            }
            return validResult;
         }).value(factory.recordSet, {adapter: items.getAdapter()});
      } else {
         result = items;
      }

      return result;
   }

   private _reloadHistoryItems(historyId: string): void {
      this._historyItems = this._filterHistoryItems(HistoryUtils.getHistorySource({historyId}).getItems());
      this._hasHistory = !!this._historyItems.getCount();
   }

   private _cloneItems(items) {
      if (items['[Types/_entity/CloneableMixin]']) {
         return items.clone();
      }
      return Clone(items);
   }

   private _getFilter(items: IFilterItem[]): object {
      const filter = {};
      chain.factory(items).each((item) => {
         if (!isEqual(getPropValue(item, 'value'), getPropValue(item, 'resetValue')) &&
             (getPropValue(item, 'visibility') === undefined || getPropValue(item, 'visibility'))) {
            filter[this._getItemName(item)] = getPropValue(item, 'value');
         }
      });
      return filter;
   }

   private _isChangedValue(items: IFilterItem[]): boolean {
      let isChanged = false;
      chain.factory(items).each((item) => {
         if ((getPropValue(item, 'resetValue') !== undefined && !isEqual(getPropValue(item, 'value'), getPropValue(item, 'resetValue')) &&
             getPropValue(item, 'visibility') === undefined) || getPropValue(item, 'visibility')) {
            isChanged = true;
         }
      });
      return isChanged;
   }

   private _validate(): Promise<IValidateResult | Error> {
      return this._children.formController.submit();
   }

   private _isPassedValidation(result: IValidateResult): boolean {
      let isPassedValidation = true;
      chain.factory(result).each((value) => {
         if (value) {
            isPassedValidation = false;
         }
      });
      return isPassedValidation;
   }

   private _getKeyProperty(items: IFilterItem[]): string {
      const firstItem = chain.factory(items).first();
      return firstItem.hasOwnProperty('name') ? 'name' : 'id';
   }

   private _prepareItems(items: IFilterItem[]): IFilterItem[] {
      let value;
      let isValueReseted;
      chain.factory(items).each((item) => {
         value = getPropValue(item, 'value');
         if (item.hasOwnProperty('resetValue')) {
            isValueReseted = isEqual(value, getPropValue(item, 'resetValue'));
         } else {
            // if the missing resetValue field, by value field we determine that the filter should be moved
            isValueReseted = !value || value.length === 0;
         }
         if (getPropValue(item, 'visibility') === true && isValueReseted) {
            setPropValue(item, 'visibility', false);
         }
      });
      return items;
   }

   static getDefaultOptions(): IFilterDetailPanelOptions {
      return {
         headingCaption: rk('Отбираются'),
         headingStyle: 'secondary',
         orientation: 'vertical',
         applyButtonCaption: rk('Отобрать'),
         additionalPanelTemplate: 'Controls/filterPopup:AdditionalPanelTemplate'
      };
   }
}

Object.defineProperty(FilterPanel, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return FilterPanel.getDefaultOptions();
   }
});

export default FilterPanel;

/**
 * @name Controls/_filterPopup/DetailPanel#topTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения заголовка на Панели фильтров.
 */

/**
 * @typedef {String} HistorySaveMode
 * @variant pinned По ховеру на элемент появляется команда закрепления записи.
 * @variant favorite По ховеру на элемент появляется команда добавления записи в избранное.
 */

/**
 * @name Controls/_filterPopup/DetailPanel#historySaveMode
 * @cfg {HistorySaveMode} Режим работы с историей фильтров.
 */

/**
 * @event Происходит при клике по кнопке "Отобрать".
 * @name Controls/_filterPopup/DetailPanel#sendResult
 * @param {Object} filter Объект фильтра {'filter_id': 'filter_value'}.
 * @param {Object} items Набор элементов.
 */

/*
   * @event Happens when clicking the button "Select".
   * @name Controls/_filterPopup/DetailPanel#sendResult
   * @param {Object} filter Filter object view {'filter_id': 'filter_value'}
   * @param {Object} items items
   */

/**
 * @event Происходит при применении фильтра из истории фильтров.
 * @name Controls/_filterPopup/DetailPanel#historyApply
 * @param {Vdom/Vdom:SyntheticEvent} event Объект события.
 * @param {Controls/_filter/View/interface/IFilterItem#source} source Конфигурация фильтра.
 */
