import rk = require('i18n!Controls');
import Control = require('Core/Control');
import template = require('wml!Controls/_dropdown/Button/Button');
import MenuUtils = require('Controls/_dropdown/Button/MenuUtils');
import tmplNotify = require('Controls/Utils/tmplNotify');
import ActualApi from 'Controls/_buttons/ActualApi';

/**
 * Контрол «Кнопка с меню».
 * 
 * Полезные ссылки:
 * * <a href="/materials/demo-ws4-button-menu">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/button/">руководство разработчика</a>
 *
 * @class Controls/_dropdown/Button
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/ITooltip
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_dropdown/interface/IFooterTemplate
 * @mixes Controls/_dropdown/interface/IHeaderTemplate
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_dropdown/interface/IGrouped
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/IIconStyle
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_buttons/interface/IButton
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Button
 * @demo Controls-demo/Buttons/Menu/MenuPG
 */

/*
 * Button by clicking on which a drop-down list opens.
 *
 * <a href="/materials/demo-ws4-button-menu">Demo-example</a>.
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
 * @mixes Controls/_interface/IIconStyle
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Button
 * @demo Controls-demo/Buttons/Menu/MenuPG
 */

var Button = Control.extend({
   _template: template,
   _tmplNotify: tmplNotify,
   _hasIconPin: true,

   constructor: function () {
      Button.superclass.constructor.apply(this, arguments);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);
   },

   _beforeMount: function (options) {
      this._offsetClassName = MenuUtils.cssStyleGeneration(options);
      this._updateState(options);
   },

   _beforeUpdate: function (options) {
      if (this._options.size !== options.size || this._options.icon !== options.icon ||
         this._options.viewMode !== options.viewMode) {
         this._offsetClassName = MenuUtils.cssStyleGeneration(options);
      }
      this._updateState(options);
   },

   _updateState: function (options) {
      const currentButtonClass = ActualApi.styleToViewMode(options.style);

      this._fontSizeButton = ActualApi.fontSize(options);
      this._viewModeButton = ActualApi.viewMode(currentButtonClass.viewMode, options.viewMode).viewMode;
   },

   _dataLoadCallback: function (items) {
      this._hasItems = items.getCount() > 0;

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(items);
      }
   },

   _onItemClickHandler: function (event, result) {
      //onMenuItemActivate will deleted by task https://online.sbis.ru/opendoc.html?guid=6175f8b3-4166-497e-aa51-1fdbcf496944
      const onMenuItemActivateResult = this._notify('onMenuItemActivate', [result[0]]);
      const menuItemActivateResult = this._notify('menuItemActivate', [result[0]]);
      let handlerResult;

      // (false || undefined) === undefined
      if (onMenuItemActivateResult !== undefined) {
         handlerResult = onMenuItemActivateResult;
      } else {
         handlerResult = menuItemActivateResult;
      }

      return handlerResult;
   },

   _onPinClickHandler: function (event, item) {
      var self = this;
      const meta =  {
         $_pinned: !item.get('pinned')
      };
      this._options.source.update(item.clone(), meta).addCallback(function (result) {
         if (!result) {
            self._children.notificationOpener.open({
               template: 'Controls/popupTemplate:NotificationSimple',
               templateOptions: {
                  style: 'danger',
                  text: rk('Невозможно закрепить более 10 пунктов'),
                  icon: 'Alert'
               }
            });
         }
      });
   },

   openMenu(popupOptions?: object): void {
      this._children.controller.openMenu(popupOptions);
   },

   closeMenu(): void {
      this._children.controller.closeMenu();
   }

});

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
 * @cfg {boolean} Конфигурация шапки меню.
 * @name Controls/_dropdown/Button#headConfig
 * @deprecated Используйте {@link Controls/_dropdown/interface/IHeaderTemplate#headerTemplate}.
 */

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

