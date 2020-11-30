/**
 * Created by am.gerasimov on 18.04.2018.
 */
import Control = require('Core/Control');
import template = require('wml!Controls/_suggestPopup/List/List');
import clone = require('Core/core-clone');
import _SuggestOptionsField = require('Controls/_suggestPopup/_OptionsField');
import {tmplNotify} from 'Controls/eventUtils';
import { constants } from 'Env/Env';
import {RecordSet} from 'Types/collection';

const DIALOG_PAGE_SIZE = 25;

const _private = {
   checkContext(self, context) {
      if (context && context.suggestOptionsField) {
         self._suggestListOptions = context.suggestOptionsField.options;

         if (!self._layerName && self._suggestListOptions.layerName) {
            self._layerName = self._suggestListOptions.layerName.split('_').pop();
         }

         if (self._suggestListOptions.dialogMode) {
            if (self._suggestListOptions.navigation) {
               const navigation = clone(self._suggestListOptions.navigation);

               /* to turn on infinityScroll */
               navigation.view = 'infinity';
               if (!navigation.viewConfig) {
                  navigation.viewConfig = {};
               }

               /* to show paging */
               navigation.viewConfig.pagingMode = true;
               navigation.sourceConfig.pageSize = DIALOG_PAGE_SIZE;
               self._navigation = navigation;
            }
         } else {
            self._navigation = self._suggestListOptions.navigation;
            self._reverseList = self._suggestListOptions.reverseList;
         }
      }
   },

   isTabChanged(options, tabKey) {
      const currentTabSelectedKey = options.tabsSelectedKey;
      return currentTabSelectedKey !== tabKey;
   },

   getTabKeyFromContext(context) {
      const tabKey = context && context.suggestOptionsField && context.suggestOptionsField.options.tabsSelectedKey;
      return tabKey !== undefined ? tabKey : null;
   },

   dispatchEvent(container, nativeEvent, customEvent) {
      customEvent.keyCode = nativeEvent.keyCode;
      container.dispatchEvent(customEvent);
   },

   // Список и input находят в разных контейнерах, поэтому мы просто проксируем нажатие клавиш up, down, enter с input'a
   // на контейнер списка, используя при этом API нативного Event'a. Будет переделано в 600 на HOC'и для горячих клавишь
   // https://online.sbis.ru/opendoc.html?guid=eb58d82c-014f-4608-8c61-b9127730a637
   getEvent(eventName): Event {
      let event;

      // ie does not support Event constructor
      if (typeof(Event) === 'function') {
         event = new Event(eventName);
      } else {
         event = document.createEvent('Event');
         event.initEvent(eventName, true, true);
      }
      return event;
   }
};

/**
 * Контрол-контейнер, который используется для работы <a href="/doc/platform/developmentapl/interface-development/controls/input/suggest/">автодополнения</a> в поле ввода.
 * Он обеспечивает связь поля ввода и списка внутри выпадающего блока.
 * @remark
 *
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/suggest/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_suggestPopup.less">переменные тем оформления</a>
 * @example
 * 
 * <pre class="brush: js">
 * // JavaScript
 * define('myControl/SuggestList',
 *    [
 *       'UI/Base',
 *       'wml!myControl/SuggestList'
 *    ], function(Base, template) {
 *       'use strict';
 *         
 *       return Base.Control.extend({
 *          _template: template
 *       });
 *    }
 * );
 * </pre>
 * 
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.suggestPopup:ListContainer>
 *    <Controls.list:View
 *       displayProperty="title"
 *       keyProperty="id"
 *       attr:class="demo-SuggestList"/>
 * </Controls.suggestPopup:ListContainer>
 * </pre>
 * @demo Controls-demo/Input/Suggest/Suggest
 * @demo Controls-demo/LookupNew/Input/SuggestPopupOptions/Index
 * @class Controls/_suggestPopup/List
 * @extends Core/Control
 * @author Герасимов А.М.
 * 
 * @public
 */

/*
 * Container for list inside Suggest.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/suggest/'>here</a>.
 *
 * @class Controls/_suggestPopup/List
 * @extends Core/Control
 * @author Герасимов Александр
 * 
 * @public
 */
const List = Control.extend({

   _template: template,
   _notifyHandler: tmplNotify,
   _markedKey: null,
   _items: null,
   _layerName: null,
   _isSuggestListEmpty: false,

   _beforeMount(options, context) {
      this._collectionChange = this._collectionChange.bind(this);
      this._itemsReadyCallback = this._itemsReadyCallback.bind(this);

      const currentReverseList = this._reverseList;
      _private.checkContext(this, context);

      if (this._reverseList !== currentReverseList) {
         if (this._reverseList) {
            this._suggestListOptions.suggestDirectionChangedCallback('up');
         } else {
            this._suggestListOptions.suggestDirectionChangedCallback('down');
         }
      }

      const items = this._suggestListOptions.sourceController &&
          this._suggestListOptions.sourceController.getItems();

      if (items) {
         this._itemsReadyCallback(items);
      }
   },

   _beforeUpdate(newOptions, context) {
      const tabKey = _private.getTabKeyFromContext(context);

      /* Need notify after getting tab from query */
      if (_private.isTabChanged(this._suggestListOptions, tabKey)) {
         this._notify('tabsSelectedKeyChanged', [tabKey]);
      }

      const currentReverseList = this._reverseList;
      _private.checkContext(this, context);

      if (this._reverseList !== currentReverseList) {
         if (this._reverseList) {
            this._suggestListOptions.suggestDirectionChangedCallback('up');
         } else {
            this._suggestListOptions.suggestDirectionChangedCallback('down');
         }
      }
   },

   _tabsSelectedKeyChanged(event, key) {
      /* It is necessary to separate the processing of the tab change by suggest layout and
       a user of a control.
       To do this, using the callback-option that only suggest layout can pass.
       Event should fired only once and after list was loading,
       because in this event user can change template of a List control. */
      this._suggestListOptions.tabsSelectedKeyChangedCallback(key);

      // FIXME remove after https://online.sbis.ru/opendoc.html?guid=5c91cf92-f61e-4851-be28-3f196945884c
      if (this._options.task1176635657) {
         this._notify('tabsSelectedKeyChanged', [key]);
      }
   },

   _itemsReadyCallback(items: RecordSet): void {
      this._unsubscribeFromItemsEvents();
      this._items = items;
      this._items.subscribe('onCollectionChange', this._collectionChange);
   },

   _collectionChange(): void {
      const isMaxCountNavigation = this._suggestListOptions &&
                                   this._suggestListOptions.navigation &&
                                   this._suggestListOptions.navigation.view === 'maxCount';
      if (isMaxCountNavigation) {
         this._isSuggestListEmpty = !this._items.getCount();
      }

      const results = this._items.getMetaData().results;
      const currentTabMetaKey = results && results.get('tabsSelectedKey');

      if (currentTabMetaKey && currentTabMetaKey !== this._suggestListOptions.tabsSelectedKey) {
         this._suggestListOptions.tabsSelectedKey = currentTabMetaKey;
         this._notify('tabsSelectedKeyChanged', [currentTabMetaKey]);
      }
   },

   _unsubscribeFromItemsEvents(): void {
      if (this._items) {
         this._items.unsubscribe('onCollectionChange', this._collectionChange);
      }
   },

   _beforeUnmount(): void {
      this._unsubscribeFromItemsEvents();
      this._items = null;
   },

   _inputKeydown(event, domEvent) {
      const
         items = this._items,
         itemsCount = items && items.getCount();

      if (this._markedKey === null && itemsCount && domEvent.nativeEvent.keyCode === constants.key.up) {
         const indexLastItem = this._reverseList ? 0 : itemsCount - 1;
         this._markedKey = items.at(indexLastItem).getId();
      } else {
         /* TODO will refactor on the project https://online.sbis.ru/opendoc.html?guid=a2e1122b-ce07-4a61-9c04-dc9b6402af5d
          remove list._container[0] after https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3 */
         const
            list = this._children.list,
            listContainer = list._container[0] || list._container,
            customEvent = _private.getEvent('keydown');

         _private.dispatchEvent(listContainer, domEvent.nativeEvent, customEvent);
      }
   },

   _markedKeyChanged(event, key) {
      this._markedKey = key;
      return this._notify('markedKeyChanged', [key]);
   }
});

List.contextTypes = function() {
   return {
      suggestOptionsField: _SuggestOptionsField
   };
};

List._theme = ['Controls/suggest', 'Controls/suggestPopup'];
List._private = _private;

export = List;
