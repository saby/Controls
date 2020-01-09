import rk = require('i18n!Controls');
import Control = require('Core/Control');
import template = require('wml!Controls/_dropdown/Input/Input');
import defaultContentTemplate = require('wml!Controls/_dropdown/Input/resources/defaultContentTemplate');
import Utils = require('Types/util');
import chain = require('Types/chain');
import dropdownUtils = require('Controls/_dropdown/Util');

var getPropValue = Utils.object.getPropertyValue.bind(Utils);

var _private = {
   getSelectedKeys: function (items, keyProperty) {
      var keys = [];
      chain.factory(items).each(function (item) {
         keys.push(getPropValue(item, keyProperty));
      });
      return keys;
   },

   getTooltip: function (items, displayProperty) {
      var tooltips = [];
      chain.factory(items).each(function (item) {
         tooltips.push(getPropValue(item, displayProperty));
      });
      return tooltips.join(', ');
   },

   isEmptyItem: function(self, item) {
      return self._options.emptyText && (getPropValue(item, self._options.keyProperty) === null || !item);
   },

   getText: function(self, items) {
      let text = '';
      if (_private.isEmptyItem(self, items[0])) {
         text = dropdownUtils.prepareEmpty(self._options.emptyText);
      } else {
         text = getPropValue(items[0], self._options.displayProperty);
      }
      return text;
   },

   getMoreText: function(items) {
      let moreText = '';
      if (items.length > 1) {
         moreText = ', ' + rk('еще') + ' ' + (items.length - 1);
      }
      return moreText;
   }
};

/**
 * Контрол, позволяющий выбрать значение из списка. Отображается в виде ссылки.
 * Текст ссылки отображает выбранные значения. Значения выбирают в выпадающем меню, которое по умолчанию закрыто.
 * Меню можно открыть кликом на контрол. Для работы единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
 * <a href="/materials/demo-ws4-input-dropdown">Демо-пример</a>.
 * Руководство разработчика {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/dropdown-menu/ Меню и выпадающий список}.
 *
 * @class Controls/_dropdown/Input
 * @extends Core/Control
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/Input/interface/IValidation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_dropdown/interface/IFooterTemplate
 * @mixes Controls/_dropdown/interface/IHeaderTemplate
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/IDropdownEmptyText
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/_dropdown/interface/IGrouped
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @control
 * @public
 * @author Золотова Э.Е.
 * @category Input
 * @demo Controls-demo/Input/Dropdown/DropdownPG
 */

/*
 * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
 * The full list of options is displayed when you click on the control.
 * <a href="/materials/demo-ws4-input-dropdown">Demo-example</a>.
 *
 * To work with single selectedKeys option you can use control with {@link Controls/source:SelectedKey}.
 * @class Controls/_dropdown/Input
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/Input/interface/IValidation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_dropdown/interface/IFooterTemplate
 * @mixes Controls/_dropdown/interface/IHeaderTemplate
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/IDropdownEmptyText
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/_dropdown/interface/IGrouped
 * @mixes Controls/_interface/ITextValue
 * @control
 * @public
 * @author Золотова Э.Е.
 * @category Input
 * @demo Controls-demo/Input/Dropdown/DropdownPG
 */

/**
 * @name Controls/_dropdown/Input#contentTemplate
 * @cfg {Function} Шаблон, который будет отображать вызываемый элемент.
 * @remark
 * Для определения шаблона вызовите базовый шаблон - "Controls/dropdown:inputDefaultContentTemplate".
 * Шаблон должен быть помещен в контрол с помощью тега <ws:partial> с атрибутом "template".
 * Содержимое можно переопределить с помощью параметра "contentTemplate".
 * Базовый шаблон Controls/dropdown:inputDefaultContentTemplate по умолчанию отображает только текст.
 * Для отображения иконки и текста используйте шаблон "Controls/dropdown:defaultContentTemplateWithIcon".
 * @example
 * Отображение иконки и текста.
 *
 * WML:
 * <pre>
 * <Controls.dropdown:Input
 *       bind:selectedKeys="_selectedKeys"
 *       keyProperty="id"
 *       displayProperty="title"
 *       source="{{_source)}}"
 *       contentTemplate="Controls/dropdown:defaultContentTemplateWithIcon">
 * </Controls.dropdown:Input>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Name', icon: 'icon-small icon-TrendUp'},
 *       {id: 2, title: 'Date of change', icon: 'icon-small icon-TrendDown'}
 *    ]
 * });
 * </pre>
 */

/*
 * @name Controls/_dropdown/Input#contentTemplate
 * @cfg {Function} Template that will be render calling element.
 * @remark
 * To determine the template, you should call the base template "Controls/dropdown:inputDefaultContentTemplate".
 * The template should be placed in the component using the <ws:partial> tag with the template attribute.
 * You can redefine content using the contentTemplate option.
 * By default, the base template Controls/dropdown:inputDefaultContentTemplate will display only text.
 * To display the icon and text, use the "Controls/dropdown:defaultContentTemplateWithIcon" template.
 * @example
 * Display text and icon
 *
 * WML:
 * <pre>
 * <Controls.dropdown:Input
 *       bind:selectedKeys="_selectedKeys"
 *       keyProperty="id"
 *       displayProperty="title"
 *       source="{{_source)}}"
 *       contentTemplate="Controls/dropdown:defaultContentTemplateWithIcon">
 * </Controls.dropdown:Input>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Name', icon: 'icon-small icon-TrendUp'},
 *       {id: 2, title: 'Date of change', icon: 'icon-small icon-TrendDown'}
 *    ]
 * });
 * </pre>
 */

/**
 * @name Controls/_dropdown/Input#multiSelect
 * @cfg {Boolean} Определяет, установлен ли множественный выбор.
 * @default false
 * @example
 * Множественный выбор установлен.
 * WML:
 * <pre>
 * <Controls.dropdown:Input
 *       bind:selectedKeys="_selectedKeys"
 *       keyProperty="id"
 *       displayProperty="title"
 *       source="{{_source}}"
 *       multiSelect="{{true}}">
 * </Controls.dropdown:Input>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl'},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._selectedKeys = [1, 3];
 * </pre>
 */

/*
 * @name Controls/_dropdown/Input#multiSelect
 * @cfg {Boolean} Determines whether multiple selection is set.
 * @default false
 * @example
 * Multiple selection is set.
 * WML:
 * <pre>
 * <Controls.dropdown:Input
 *       bind:selectedKeys="_selectedKeys"
 *       keyProperty="id"
 *       displayProperty="title"
 *       source="{{_source}}"
 *       multiSelect="{{true}}">
 * </Controls.dropdown:Input>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl'},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._selectedKeys = [1, 3];
 * </pre>
 */

/**
 * @event Controls/_dropdown/Input#selectedKeysChanged Происходит при изменении выбранных элементов.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} keys Массив ключей выбранных элементов.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, выпадающий список не закроется.
 * По умолчанию, когда выбран пункт с иерархией, выпадающий список закрывается.
 * @example
 * В следующем примере создается список и устанавливается опция selectedKeys со значением [1, 2, 3], а также показано, как изменить сообщение, выведенное пользователю на основе выбора.
 * TMPL:
 * <pre>
 *    <Controls.dropdown:Input on:selectedKeysChanged="onSelectedKeysChanged()"
 *                             selectedKeys="{{ _selectedKeys }}"/>
 *    <h1>{{ _message }}</h1>
 * </pre>
 * JS:
 * <pre>
 *     _beforeMount: function() {
 *       this._selectedKeys = [1, 2, 3];
 *    },
 *    onSelectedKeysChanged: function(e, keys) {
 *       this._selectedKeys = keys; //We don't use binding in this example so we have to update state manually.
 *       if (keys.length > 0) {
 *          this._message = 'Selected ' + keys.length + ' items.';
 *       } else {
 *          this._message = 'You have not selected any items.';
 *       }
 *    }
 * </pre>
 */

var Input = Control.extend({
   _template: template,
   _defaultContentTemplate: defaultContentTemplate,
   _text: '',
   _hasMoreText: '',

   _beforeMount: function () {
      this._setText = this._setText.bind(this);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);
   },

   _afterMount: function (options) {
      /* Updating the text in the header.
      Since the text is set after loading source, the caption stored old value */
      if (options.showHeader && options.caption !== this._text) {
         this._forceUpdate();
      }
   },

   _selectedItemsChangedHandler: function (event, items) {
      this._notify('textValueChanged', [_private.getText(this, items) + _private.getMoreText(items)]);
      return this._notify('selectedKeysChanged', [_private.getSelectedKeys(items, this._options.keyProperty)]);
   },

   _dataLoadCallback: function (items) {
      this._countItems = items.getCount();
      if (this._options.emptyText) {
         this._countItems += 1;
      }

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(items);
      }
   },

   _setText: function (items) {
      if (items.length) {
         this._item = items[0];
         this._isEmptyItem = _private.isEmptyItem(this, this._item);
         this._icon = this._isEmptyItem ? null : getPropValue(this._item, 'icon');
         this._text = _private.getText(this, items);
         this._hasMoreText = _private.getMoreText(items);
         this._tooltip = _private.getTooltip(items, this._options.displayProperty);
      }
   },

   // Делаем через событие deactivated на Controller'e,
   // т.к в Controller передается просто шаблон, а не контрол, который не обладает состоянием активности,
   // и подписка на _deactivated на это шаблоне работать не будет
   _deactivated: function () {
      this.closeMenu();
   },

   openMenu(popupOptions?: object): void {
      this._children.controller.openMenu(popupOptions);
   },

   closeMenu(): void {
      this._children.controller.closeMenu();
   }
});

Input._theme = ['Controls/dropdown', 'Controls/Classes'];

export = Input;
