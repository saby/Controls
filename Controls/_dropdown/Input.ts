import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/Input/Input');
import defaultContentTemplate = require('wml!Controls/_dropdown/Input/resources/defaultContentTemplate');
import Utils = require('Types/util');
import chain = require('Types/chain');
import dropdownUtils = require('Controls/_dropdown/Util');
import {isEqual} from 'Types/object';
import Controller = require('Controls/_dropdown/_Controller');
import BaseDropdown = require('Controls/_dropdown/BaseDropdown');
import {SyntheticEvent} from "Vdom/Vdom";
import {Stack as StackOpener} from 'Controls/popup';

var getPropValue = Utils.object.getPropertyValue.bind(Utils);

/**
 * Контрол, позволяющий выбрать значение из списка. Отображается в виде ссылки.
 * Текст ссылки отображает выбранные значения. Значения выбирают в выпадающем меню, которое по умолчанию закрыто.
 *
 * @remark
 * Меню можно открыть кликом на контрол. Для работы единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDropdown%2FDropdown">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdown.less">переменные тем оформления dropdown</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdownPopup.less">переменные тем оформления dropdownPopup</a>
 *
 * @class Controls/_dropdown/Input
 * @extends Core/Control
 * @mixes Controls/_menu/interface/IMenuPopup
 * @mixes Controls/_menu/interface/IMenuControl
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/interface/IDropdown
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/Input/interface/IValidation
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/ISearch
 * @control
 * @public
 * @author Золотова Э.Е.
 * @category Input
 * @demo Controls-demo/Input/Dropdown/DropdownPG
 */

/*
 * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
 * The full list of options is displayed when you click on the control.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDropdown%2FDropdown">Demo-example</a>.
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

class Input extends BaseDropdown {
   protected _template: TemplateFunction = template;
   protected _defaultContentTemplate: TemplateFunction = defaultContentTemplate;
   protected _text: string = '';
   protected _hasMoreText: string = '';
   protected _selectedItems = '';

   _beforeMount(options, recievedState): Promise<object>|void {
      this._prepareDisplayState = this._prepareDisplayState.bind(this);
      this._dataLoadCallback = this._dataLoadCallback.bind(this);
      this._controller = new Controller(this._getControllerOptions(options));

      return this._controller.loadItems(recievedState);
   }

   _afterMount(options) {
      /* Updating the text in the header.
      Since the text is set after loading source, the caption stored old value */
      if (options.showHeader && options.caption !== this._text) {
         this._forceUpdate();
      }
      this._controller.registerScrollEvent();
   }

   _beforeUpdate(options) {
      this._controller.update(this._getControllerOptions(options));
   }

   _getControllerOptions(options): object {
      return { ...options, ...{
            dataLoadCallback: this._dataLoadCallback,
            selectedKeys: options.selectedKeys || [],
            popupClassName: options.popupClassName || (options.showHeader || options.headerTemplate ?
                           'controls-DropdownList__margin-head' : options.multiSelect ?
                           'controls-DropdownList_multiSelect__margin' :  'controls-DropdownList__margin') +
                           ' theme_' + options.theme,
            caption: options.caption || this._text ,
            allowPin: false,
            selectedItemsChangedCallback: this._prepareDisplayState.bind(this),
            openerControl: this
         }
      };
   }

   _selectedItemsChangedHandler(items) {
      this._notify('textValueChanged', [this._getText(items) + this._getMoreText(items)]);
      const newSelectedKeys = this._getSelectedKeys(items, this._options.keyProperty);
      if (!isEqual(this._options.selectedKeys, newSelectedKeys) || this._options.task1178744737) {
         return this._notify('selectedKeysChanged', [newSelectedKeys]);
      }
   }

   _dataLoadCallback(items): void {
      this._countItems = items.getCount();
      if (this._options.emptyText) {
         this._countItems += 1;
      }

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(items);
      }
   }

   _prepareDisplayState(items): void {
      if (items.length) {
         this._selectedItems = items;
         this._needInfobox = this._options.readOnly && this._selectedItems.length > 1;
         this._item = items[0];
         this._isEmptyItem = this.isEmptyItem(this._item);
         this._icon = this._isEmptyItem ? null : getPropValue(this._item, 'icon');
         this._text = this._getText(items);
         this._hasMoreText = this._getMoreText(items);
         this._tooltip = this._getTooltip(items, this._options.displayProperty);
      }
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
      this._controller.setMenuPopupTarget(this._container);
      this._controller.openMenu(config).then((result) => {
         if (typeof result === 'string') {
            this._popupId = result;
         } else if (result) {
            this._selectedItemsChangedHandler(result);
         }
      });
   }

   protected _onResult(action, data) {
      switch (action) {
         case 'applyClick':
            this._applyClick(data);
            break;
         case 'itemClick':
            this._itemClick(data);
            break;
         case 'selectorResult':
            this._selectorResult(data);
            break;
         case 'selectorDialogOpened':
            this._selectorDialogOpened(data);
            break;
         case 'footerClick':
            this._footerClick(data);
      }
   }

   protected _itemClick(data): void {
      const item = this._controller.getPreparedItem(data, this._options.keyProperty, this._source);
      const res = this._selectedItemsChangedHandler([item]);

      // dropDown must close by default, but user can cancel closing, if returns false from event
      if (res !== false) {
         this._controller.applyClick(item);
      }
   }

   protected _applyClick(data): void {
      this._selectedItemsChangedHandler(data);
      this._controller.applyClick(data);
   }

   protected _selectorResult(data): void {
      this._controller.onSelectorResult(data);
      this._selectedItemsChangedHandler(data);
   }

   protected _selectorTemplateResult(event, selectedItems): void {
      let result = this._notify('selectorCallback', [this._initSelectorItems, selectedItems]) || selectedItems;
      this._selectorResult(result);
   }

   _beforeUnmount(): void {
      this._controller.destroy();
   }

   private _getSelectedKeys(items, keyProperty) {
      let keys = [];
      chain.factory(items).each(function (item) {
         keys.push(getPropValue(item, keyProperty));
      });
      return keys;
   }

   private _getTooltip(items, displayProperty) {
      var tooltips = [];
      chain.factory(items).each(function (item) {
         tooltips.push(getPropValue(item, displayProperty));
      });
      return tooltips.join(', ');
   }

   private isEmptyItem(item) {
      return this._options.emptyText && (getPropValue(item, this._options.keyProperty) === null || !item);
   }

   private _getText(items) {
      let text = '';
      if (this.isEmptyItem(items[0])) {
         text = dropdownUtils.prepareEmpty(this._options.emptyText);
      } else {
         text = getPropValue(items[0], this._options.displayProperty);
      }
      return text;
   }

   private _getMoreText(items) {
      let moreText = '';
      if (items.length > 1) {
         moreText = ', ' + rk('еще') + ' ' + (items.length - 1);
      }
      return moreText;
   }
}

Input._theme = ['Controls/dropdown', 'Controls/Classes'];

export = Input;
