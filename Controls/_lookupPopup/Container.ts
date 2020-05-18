import Control = require('Core/Control');
import template = require('wml!Controls/_lookupPopup/Container');
import ControllerContext = require('Controls/_lookupPopup/__ControllerContext');
import chain = require('Types/chain');
import Utils = require('Types/util');
import cInstance = require('Core/core-instance');
import {ContextOptions} from 'Controls/context';
import {CrudWrapper} from 'Controls/source';
import {selectionToRecord} from 'Controls/operations';
import {adapter as adapterLib} from 'Types/entity';
import {IData, IDecorator} from 'Types/source';
import {List, RecordSet} from 'Types/collection';
import {ISelectionObject, TSelectionRecord, TSelectionType} from 'Controls/interface';

/**
 * Контейнер принимает опцию selectedItems от Controls/lookupPopup:Controller и устанавливает опцию selectedKeys для дочернего списка.
 * Загружает список записей по списку первичных ключей из опции selectedKeys при завершении выбора
 * Должен использоваться внутри Controls/lookupPopup:Controller.
 * В одном Controls/lookupPopup:Controller можно использовать несколько контейнеров.
 *
 * Подробное описание и инструкцию по настройке смотрите в <a href='/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/'>статье</a>.
 *
 * <a href="/materials/Controls-demo/app/Engine-demo%2FSelector">Пример</a> использования контрола.
 *
 * @class Controls/_lookupPopup/Container
 * @extends Core/Control
 * @control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/ISelectionType
 * @public
 * @author Герасимов Александр Максимович
 */

/*
 * Container transfers selected items fromControls/lookupPopup:Controller to a specific list.
 * Loading data by selectedKeys on selection complete.
 * Must used inside Controls/lookupPopup:Controller.
 * In one Controls/lookupPopup:Controller can be used some Containers.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/'>here</a>.
 *
 * <a href="/materials/Controls-demo/app/Engine-demo%2FSelector">Here</a> you can see a demo.
 *
 * @class Controls/_lookupPopup/Container
 * @extends Core/Control
 * @control
 * @mixes Controls/_interface/ISource
 * @public
 * @author Герасимов Александр Максимович
 */


/**
 * @name Controls/_lookupPopup/Container#selectionFilter
 * @cfg {Function} Функция обратного вызова, с помощью которой происходит фильтрация выбранных записей для конкретного списка.
 * Функция должна вернуть true если запись относится к данному списку или false, если не относится.
 * @remark По умолчанию опция selectionFilter установлена как функция, которая всегда возвращает true.
 * @example
 *
 * WML:
 * <pre>
 *    <Controls.lookupPopup:Container selectionFilter="{{_selectionFilter}}">
 *        ...
 *    </Controls.lookupPopup:Container>
 * </pre>
 *
 * JS:
 * <pre>
 *     _selectionFilter: function(item, index) {
 *        let filterResult = false;
 *
 *        if (item.get('Компания')) {
 *            filterResult = true;
 *        }
 *
 *        return filterResult;
 *     }
 * </pre>
 */

/*
 * @name Controls/_lookupPopup/Container#selectionFilter
 * @cfg {Function} Function that filters selectedItems from Controls/lookupPopup:Controller for a specific list.
 * @remark By default selectionFilter option is setted as function that always returns true.
 * @example
 *
 * WML:
 * <pre>
 *    <Controls.lookupPopup:Container selectionFilter="{{_selectionFilter}}">
 *        ...
 *    </Controls.lookupPopup:Container>
 * </pre>
 *
 * JS:
 * <pre>
 *     _selectionFilter: function(item, index) {
 *        let filterResult = false;
 *
 *        if (item.get('Компания')) {
 *            filterResult = true;
 *        }
 *
 *        return filterResult;
 *     }
 * </pre>
 */


/**
 * @name Controls/_lookupPopup/Container#selectionType
 * @cfg {String} Тип записей, которые можно выбрать.
 * @variant node только узлы доступны для выбора
 * @variant leaf только листья доступны для выбора
 * @variant all все типы записей доступны для выбора
 * @example
 * В данном примере для выбора доступны только листья.
 * <pre>
 *    <Controls.lookupPopup:ListContainer selectionType="leaf">
 *        ...
 *    </Controls.lookupPopup:ListContainer>
 * </pre>
 */

/*
 * @name Controls/_lookupPopup/Container#selectionType
 * @cfg {String} Type of records that can be selected.
 * @variant node only nodes are available for selection
 * @variant leaf only leafs are available for selection
 * @variant all all types of records are available for selection
 * @example
 * In this example only leafs are available for selection.
 * <pre>
 *    <Controls.lookupPopup:ListContainer selectionType="leaf">
 *        ...
 *    </Controls.lookupPopup:ListContainer>
 * </pre>
 */



      var SELECTION_TYPES = ['all', 'leaf', 'node'];

      var _private = {
         getFilteredItems: function(items, filterFunc) {
            return chain.factory(items).filter(filterFunc).value();
         },

         getKeysByItems: function(items, keyProperty) {
            return chain.factory(items).reduce(function(result, item) {
               result.push(item.get(keyProperty));
               return result;
            }, []);
         },

         getFilterFunction: function(func) {
            return func ? func : function() {
               return true;
            };
         },

         getSelectedKeys: function(options, context) {
            const selectedItems = _private.getSelectedItems(options, context);
            const items = _private.getFilteredItems(selectedItems, _private.getFilterFunction(options.selectionFilter));
            return _private.getKeysByItems(items, context.dataOptions.keyProperty);
         },

         getSelectedItems(options, context): List|RecordSet  {
            return options.selectedItems || context.selectorControllerContext.selectedItems || new List();
         },

         getCrudWrapper: function(source) {
            return new CrudWrapper({
               source: source
            });
         },

         getEmptyItems: function(currentItems) {
            /* make clone and clear to save items format */
            var emptyItems = currentItems.clone();
            emptyItems.clear();
            return emptyItems;
         },

         getValidSelectionType: function(selectionType) {
            let type;

            if (SELECTION_TYPES.indexOf(selectionType) !== -1) {
               type = selectionType;
            } else {
               type = 'all';
            }

            return type;
         },

         getSourceAdapter(source: IData): adapterLib.IAdapter {
            let adapter: adapterLib.IAdapter;

            if (cInstance.instanceOfMixin(source, 'Types/_source/IDecorator')) {
               adapter = ((source as IDecorator).getOriginal() as IData).getAdapter();
            } else {
               adapter = source.getAdapter();
            }

            return adapter;
         },

         prepareFilter(filter: object, selection: TSelectionRecord, searchParam: string|undefined, parentProperty: string): object {
            filter = Utils.object.clone(filter);

             // FIXME https://online.sbis.ru/opendoc.html?guid=e8bcc060-586f-4ca1-a1f9-1021749f99c2
             // TODO KINDO
             // При отметке всех записей в фильтре проставляется selection в виде:
             // marked: [null]
             // excluded: [null]
             // Если что-то поискать, отметить всё через панель массовых операций, и нажать "Выбрать"
             // то в фильтр необходимо посылать searchParam и selection, иначе выборка будет включать все записи,
             // даже которые не попали под фильтрацию при поиске.
             // Если просто отмечают записи чекбоксами (не через панель массовых операций),
             // то searchParam из фильтра надо удалять, т.к. записи могут отметить например в разных разделах,
             // и запрос с searchParam в фильтре вернёт не все записи, которые есть в selection'e.
            if (searchParam && selection.get('marked')[0] !== null) {
               delete filter[searchParam];
            }
            if (parentProperty) {
               delete filter[parentProperty];
            }
            filter.selection = selection;
            return filter;
         },

         prepareResult: function(result, initialSelection, keyProperty, selectCompleteInitiator) {
            return {
               resultSelection: result,
               initialSelection: initialSelection,
               keyProperty: keyProperty,
               selectCompleteInitiator: selectCompleteInitiator
            };
         },

         getInitialSelectedItems(self, options, context): List|RecordSet {
            const selectedItems = _private.getSelectedItems(options, context).clone();
            const itemsToRemove = [];
            const keyProp = context.dataOptions.keyProperty;

            selectedItems.each((item) => {
               if (!self._selectedKeys.includes(item.get(keyProp))) {
                  itemsToRemove.push(item);
               }
            });

            itemsToRemove.forEach((item) => {
               selectedItems.remove(item);
            });

            return selectedItems;
         },

         // Задача: необходимо поддержать выбора папки без вложений, если чекбоксом отмечена только папка.
         // Для этого используем флаг recursive у платформенного итератора,
         // который как раз позволяет реализовать выбор папки без вложений.
         // Но сейчас есть проблема, если выделить папку и у дочернего элемента снять чекбокс,
         // то всё равно будет выбрана папка, хотя в этом случае должны выбраться вложения.
         // Решаем это добавлением папки в excluded, если снят чекбокс хотя бы у одного дочернего элемента.
         prepareNotRecursiveSelection(
             selection: ISelectionObject,
             items: RecordSet,
             keyProperty: string,
             parentProperty?: string,
             nodeProperty?: string
         ): ISelectionObject {
            const isNode = (key): boolean => {
               const item = items.getRecordById(key);
               return item && item.get(nodeProperty);
            };

            const hasExcludedChildren = (key): boolean => {
               const node = isNode(key);
               let hasExcludedChild = false;
               let itemId;

               if (node) {
                  items.each((item) => {
                     if (!hasExcludedChild && item.get(parentProperty) === key) {
                        itemId = item.get(keyProperty);
                        hasExcludedChild = selection.excluded.includes(itemId) || hasExcludedChildren(itemId);
                     }
                  });
               }

               return hasExcludedChild;
            };

            selection.selected.forEach((key) => {
               if (!selection.excluded.includes(key) && hasExcludedChildren(key)) {
                  selection.excluded.push(key);
               }
            });

            return selection;
         },

         getSelection(
             selection: ISelectionObject,
             adapter: adapterLib.IAdapter,
             selectionType: TSelectionType,
             recursiveSelection: boolean
         ): TSelectionRecord {
            const type = _private.getValidSelectionType(selectionType);
            return selectionToRecord(selection, adapter, type, recursiveSelection);
         },

         needLoadItemsOnSelectComplete(self): boolean {
            const hasSelectedItems = self._selectedKeys.length || self._excludedKeys.length;
            let result;

            if (self._options.multiSelect) {
               result = hasSelectedItems;
            } else {
               result = hasSelectedItems && self._selectCompleteInitiator;
            }

            return result;
         },

         loadSelectedItems(self: object, filter: object): Promise<RecordSet> {
            const dataOptions = self.context.get('dataOptions');
            const items = dataOptions.items;
            let indicatorId;
            let loadItemsPromise;

            if (_private.needLoadItemsOnSelectComplete(self)) {
               if (!self._options.multiSelect) {
                  const selectedItems = _private.getEmptyItems(items);

                  selectedItems.add(items.getRecordById(self._selectedKeys[0]));
                  loadItemsPromise = Promise.resolve(selectedItems);
               } else {
                  const crudWrapper = _private.getCrudWrapper(dataOptions.source);
                  const loadItemsCallback = (loadedItems) => {
                     self._notify('hideIndicator', [indicatorId], {bubbling: true});
                     return loadedItems;
                  };

                  indicatorId = self._notify('showIndicator', [], {bubbling: true});
                  loadItemsPromise = crudWrapper.query({filter}).then(loadItemsCallback, loadItemsCallback);
               }
            } else {
               loadItemsPromise = Promise.resolve(_private.getEmptyItems(items));
            }

            return loadItemsPromise;
         }
      };

      var Container = Control.extend({

         _template: template,
         _selectedKeys: null,
         _selection: null,
         _excludedKeys: null,
         _selectCompleteInitiator: false,

         _beforeMount(options, context): void {
            this._selectedKeys = _private.getSelectedKeys(options, context);
            this._excludedKeys = [];
            this._initialSelection = _private.getInitialSelectedItems(this, options, context);
         },

         _beforeUpdate(newOptions, context): void {
            const currentSelectedItems = this._options.selectedItems || this.context.get('selectorControllerContext').selectedItems;
            const newSelectedItems = newOptions.selectedItems || context.selectorControllerContext.selectedItems;

            if (currentSelectedItems !== newSelectedItems) {
               this._selectedKeys = _private.getSelectedKeys(newOptions, context);
            }
         },

         _selectComplete(): void {
            const options = this._options;
            const dataOptions = this.context.get('dataOptions');
            const items = dataOptions.items;
            const keyProperty = options.keyProperty;
            let loadPromise;

            const isRecursive = options.recursiveSelection;
            let selectionObject: ISelectionObject = {
               selected: this._selectedKeys,
               excluded: this._excludedKeys
            };

            if (!isRecursive) {
               selectionObject = _private.prepareNotRecursiveSelection(
                   selectionObject,
                   items,
                   keyProperty,
                   options.parentProperty,
                   options.nodeProperty
               );
            }
            const adapter = _private.getSourceAdapter(dataOptions.source);
            const selection = _private.getSelection(selectionObject, adapter, options.selectionType, isRecursive);
            const filter = _private.prepareFilter(dataOptions.filter, selection, options.searchParam, options.parentProperty);

            // FIXME https://online.sbis.ru/opendoc.html?guid=7ff270b7-c815-4633-aac5-92d14032db6f 
            // необходимо уйти от опции selectionLoadMode и вынести загрузку
            // выбранный записей в отдельный слой.
            // здесь будет только формирование фильтра
            if (this._options.selectionLoadMode) {
               loadPromise = new Promise((resolve) => {
                  _private.loadSelectedItems(this, filter).then((loadedItems) => {
                     resolve(_private.prepareResult(
                            loadedItems,
                            this._initialSelection,
                            keyProperty,
                            this._selectCompleteInitiator
                         )
                     );
                  });
               });
            } else {
               loadPromise = Promise.resolve(filter);
            }

            this._notify('selectionLoad', [loadPromise], {bubbling: true});
         },

         _selectedKeysChanged: function(event, selectedKeys, added, removed) {
            this._notify('selectedKeysChanged', [selectedKeys, added, removed], {bubbling: true});
         },

         _excludedKeysChanged: function(event, excludedKey, added, removed) {
            this._notify('excludedKeysChanged', [excludedKey, added, removed], {bubbling: true});
         },

         _selectCompleteHandler: function() {
            this._selectCompleteInitiator = true;
         }
      });

      Container.contextTypes = function() {
         return {
            selectorControllerContext: ControllerContext,
            dataOptions: ContextOptions
         };
      };

      Container.getDefaultOptions = function getDefaultOptions() {
         return {
            recursiveSelection: true,
            selectionLoadMode: true
         };
      };

      Container._private = _private;

      export = Container;

