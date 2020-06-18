import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/Button/Button');
import MenuUtils = require('Controls/_dropdown/Button/MenuUtils');
import tmplNotify = require('Controls/Utils/tmplNotify');
import ActualApi from 'Controls/_buttons/ActualApi';
import Controller = require('Controls/_dropdown/_Controller');
import {SyntheticEvent} from "Vdom/Vdom";
import BaseDropdown = require('Controls/_dropdown/BaseDropdown');
import {Stack as StackOpener} from 'Controls/popup';

/**
 * Контрол «Кнопка с меню».
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FMenu%2FMenu">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/button/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdown.less">переменные тем оформления dropdown</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdownPopup.less">переменные тем оформления dropdownPopup</a>
 *
 * @class Controls/_dropdown/Button
 * @extends Core/Control
 * @mixes Controls/_menu/interface/IMenuPopup
 * @mixes Controls/_menu/interface/IMenuControl
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/ITooltip
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_dropdown/interface/IIconSize
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_buttons/interface/IButton
 * @mixes Controls/_dropdown/interface/IGrouped
 * @mixes Controls/_interface/ISearch
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Button
 */

/*
 * Button by clicking on which a drop-down list opens.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FMenu%2FMenu">Demo-example</a>.
 *
 * @class Controls/_dropdown/Button
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/ITooltip
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_dropdown/interface/IFooterTemplate
 * @mixes Controls/_dropdown/interface/IHeaderTemplate
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_dropdown/interface/IGrouped
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/_buttons/interface/IButton
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_dropdown/interface/IIconSize
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_dropdown/interface/IGrouped
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Button
 * @demo Controls-demo/Buttons/Menu/MenuPG
 */

class Button extends BaseDropdown {
   protected _template: TemplateFunction = template;
   protected _tmplNotify: Function = tmplNotify;
   protected _hasItems: boolean = true;

   constructor() {
      super(arguments);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);
   }

   _beforeMount(options, recievedState) {
      this._offsetClassName = MenuUtils.cssStyleGeneration(options);
      this._updateState(options);
      this._controller = new Controller(this._getControllerOptions(options));

      if (!options.lazyItemsLoading) {
         return this._controller.loadItems(recievedState);
      }
   }

   _afterMount() {
      this._controller.registerScrollEvent();
   }

   _beforeUpdate(options) {
      this._controller.update(this._getControllerOptions(options));
      if (this._options.size !== options.size || this._options.icon !== options.icon ||
         this._options.viewMode !== options.viewMode) {
         this._offsetClassName = MenuUtils.cssStyleGeneration(options);
      }
      this._updateState(options);
   }

   _updateState(options) {
      const currentButtonClass = ActualApi.styleToViewMode(options.style);

      this._fontSizeButton = ActualApi.fontSize(options);
      this._viewModeButton = ActualApi.viewMode(currentButtonClass.viewMode, options.viewMode).viewMode;
   }

   _dataLoadCallback(items) {
      this._hasItems = items.getCount() > 0;

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(items);
      }
   }

   _getControllerOptions(options) {
      return { ...options, ...{
             headerTemplate: options.headTemplate || options.headerTemplate,
             dataLoadCallback: this._dataLoadCallback.bind(this),
             popupClassName: (options.popupClassName || this._offsetClassName) + ' theme_' + options.theme,
             hasIconPin: this._hasIconPin,
             allowPin: true,
             openerControl: this
         }
      };
   }

   _onItemClickHandler(result, nativeEvent) {
      //onMenuItemActivate will deleted by task https://online.sbis.ru/opendoc.html?guid=6175f8b3-4166-497e-aa51-1fdbcf496944
      const onMenuItemActivateResult = this._notify('onMenuItemActivate', [result[0], nativeEvent]);
      const menuItemActivateResult = this._notify('menuItemActivate', [result[0], nativeEvent]);
      let handlerResult;

      // (false || undefined) === undefined
      if (onMenuItemActivateResult !== undefined) {
         handlerResult = onMenuItemActivateResult;
      } else {
         handlerResult = menuItemActivateResult;
      }

      return handlerResult;
   }

   _handleMouseDown(event: SyntheticEvent): void {
      const config = {
         templateOptions: {
            selectorDialogResult: this._selectorTemplateResult.bind(this),
            selectorOpener: StackOpener
         },
         eventHandlers: {
            onOpen: this._onOpen.bind(this),
            onClose: () => {
               this._popupId = null;
               this._onClose();
            },
            onResult: this._onResult.bind(this)
         }
      };
      this._controller.setMenuPopupTarget(this._container.children[0]);
      this._controller.openMenu(config).then((result) => {
         if (typeof result === 'string') {
            this._popupId = result;
         } else if (result) {
            this._onItemClickHandler(result);
         }
      });
   }

   protected _onResult(action, data, nativeEvent) {
      switch (action) {
         case 'pinClick':
            this._controller._pinClick(data);
            break;
         case 'applyClick':
            this._applyClick(data, nativeEvent);
            break;
         case 'itemClick':
            this._itemClick(data, nativeEvent);
            break;
         case 'selectorResult':
            this._selectorResult(data, nativeEvent);
            break;
         case 'selectorDialogOpened':
            this._selectorDialogOpened(data);
            break;
         case 'footerClick':
            this._footerClick(data);
      }
   }

   protected _itemClick(data, nativeEvent): void {
      const item = this._controller.getPreparedItem(data, this._options.keyProperty, this._source);
      const res = this._onItemClickHandler([item], nativeEvent);

      // dropDown must close by default, but user can cancel closing, if returns false from event
      if (res !== false) {
         this._controller.applyClick(item);
      }
   }

   protected _applyClick(data, nativeEvent): void {
      this._onItemClickHandler(data, nativeEvent);
      this._controller.applyClick(data);
   }

   protected _selectorResult(data, nativeEvent): void {
      this._controller.onSelectorResult(data);
      this._onItemClickHandler(data, nativeEvent);
   }

   protected _selectorTemplateResult(event, selectedItems): void {
      let result = this._notify('selectorCallback', [this._initSelectorItems, selectedItems]) || selectedItems;
      this._selectorResult(result);
   }

   _beforeUnmount(): void {
      this._controller.destroy();
   }
}

Button.getDefaultOptions = function () {
   return {
      showHeader: true,
      filter: {},
      style: 'secondary',
      viewMode: 'button',
      size: 'm',
      iconStyle: 'secondary',
      transparent: true,
      lazyItemsLoading: false
   };
};

Button._theme = ['Controls/dropdown', 'Controls/Classes'];

export = Button;

/**
 * @event Controls/_dropdown/Button#menuItemActivate Происходит при выборе элемента из списка.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Выбранный элемент.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, выпадающий список не закроется.
 * По умолчанию, когда выбран пункт с иерархией, выпадающий список закрывается.
 */

/*
 * @event Controls/_dropdown/Button#menuItemActivate Occurs when an item is selected from the list.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Event object.
 * @remark If the menu has items with hierarchy and item with hierarchy was selected, you can return processing result from event handler,
 * if result will equals false, dropdown will not close. By default dropdown will close, when item with hierarchy was selected.
 */

/**
 * @name Controls/_dropdown/Button#lazyItemsLoading
 * @cfg {Boolean} Определяет, будут ли элементы меню загружаться лениво, только после первого клика по кнопке.
 * @default false
 * @remark Устанавливать опцию в значение true имеет смысл для локальных данных или
 * при полной уверенности, что источник вернёт данные для меню.
 * @example
 * В данном примере данные для меню будут загружены лениво, после первого клика по кнопке.
 * WML:
 * <pre>
 * <Controls.dropdown:Button
 *       bind:selectedKeys="_selectedKeys"
 *       keyProperty="id"
 *       displayProperty="title"
 *       source="{{_source)}}"
 *       lazyItemsLoading="{{true}}">
 * </Controls.dropdown:Input>
 * </pre>
 * JS:
 * <pre>
 * _source:null,
 * _beforeMount: function() {
 *    this._source = new source.Memory({
 *       idProperty: 'id',
 *       data: [
 *          {id: 1, title: 'Name', icon: 'icon-small icon-TrendUp'},
 *          {id: 2, title: 'Date of change', icon: 'icon-small icon-TrendDown'}
 *       ]
 *    });
 * }
 * </pre>
 */

/**
 * @name Controls/_dropdown/Button#additionalProperty
 * @cfg {String} Имя свойства, содержащего информацию о дополнительном пункте выпадающего меню. Подробное описание <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/item-config/#additional">здесь</a>.
 */
