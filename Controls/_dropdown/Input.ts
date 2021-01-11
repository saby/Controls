import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/Input/Input');
import defaultContentTemplate = require('wml!Controls/_dropdown/Input/resources/defaultContentTemplate');
import * as Utils from 'Types/util';
import {factory} from 'Types/chain';
import {Model} from 'Types/entity';
import {RecordSet, List} from 'Types/collection';
import {prepareEmpty, loadItems, loadSelectedItems, isEmptyItem} from 'Controls/_dropdown/Util';
import {isEqual} from 'Types/object';
import Controller from 'Controls/_dropdown/_Controller';
import {TKey} from './interface/IDropdownController';
import {BaseDropdown, DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IStickyPopupOptions, InfoboxTarget} from 'Controls/popup';
import {IBaseDropdownOptions} from 'Controls/_dropdown/interface/IBaseDropdown';
import getDropdownControllerOptions from 'Controls/_dropdown/Utils/GetDropdownControllerOptions';
import * as Merge from 'Core/core-merge';
import {isLeftMouseButton} from 'Controls/popup';

interface IInputOptions extends IBaseDropdownOptions {
   fontColorStyle?: string;
   fontSize?: string;
   showHeader?: boolean;
   caption?: string;
}

const getPropValue = Utils.object.getPropertyValue.bind(Utils);

interface IDropdownInputChildren {
   infoboxTarget: InfoboxTarget;
}

/**
 * Контрол, позволяющий выбрать значение из списка. Отображается в виде ссылки.
 * Текст ссылки отображает выбранные значения. Значения выбирают в выпадающем меню, которое по умолчанию закрыто.
 *
 * @remark
 * Меню можно открыть кликом на контрол. Для работы единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/dropdown-menu/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdown.less переменные тем оформления dropdown}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdownPopup.less переменные тем оформления dropdownPopup}
 *
 * @class Controls/_dropdown/Input
 * @extends UI/Base:Control
 * @mixes Controls/_menu/interface/IMenuPopup
 * @mixes Controls/_menu/interface/IMenuControl
 * @mixes Controls/_menu/interface/IMenuBase
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_dropdown/interface/IDropdownSource
 * @mixes Controls/_dropdown/interface/IBaseDropdown
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/Input/interface/IValidation
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/_interface/IIconSize
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/ISearch
 * 
 * @public
 * @author Золотова Э.Е.
 * @demo Controls-demo/dropdown_new/Input/Source/Simple/Index
 */

/*
 * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
 * The full list of options is displayed when you click on the control.
 *
 * To work with single selectedKeys option you can use control with {@link Controls/source:SelectedKey}.
 * @class Controls/_dropdown/Input
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/Input/interface/IValidation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_dropdown/interface/IFooterTemplate
 * @mixes Controls/_dropdown/interface/IHeaderTemplate
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/_dropdown/interface/IGrouped
 * @mixes Controls/_interface/ITextValue
 * 
 * @public
 * @author Золотова Э.Е.
 * @demo Controls-demo/dropdown_new/Input/Source/Index
 */

export default class Input extends BaseDropdown {
   protected _template: TemplateFunction = template;
   protected _defaultContentTemplate: TemplateFunction = defaultContentTemplate;
   protected _text: string = '';
   protected _hasMoreText: string = '';
   protected _countItems: number;
   protected _needInfobox: boolean = false;
   protected _item: Model = null;
   protected _isEmptyItem: boolean = false;
   protected _icon: string;
   protected _tooltip: string;
   protected _selectedItems: Model[];
   protected _controller: Controller;
   protected _children: IDropdownInputChildren;

   _beforeMount(options: IInputOptions,
                context: object,
                receivedState: DropdownReceivedState): void | Promise<void|DropdownReceivedState> {
      this._controller = new Controller(this._getControllerOptions(options));

      if (options.navigation && options.selectedKeys &&  options.selectedKeys.length) {
         return loadSelectedItems(this._controller, receivedState, options.source);
      } else {
         return loadItems(this._controller, receivedState, options.source);
      }
   }

   _beforeUpdate(options: IInputOptions): void {
      this._controller.update(this._getControllerOptions(options));
   }

   _getControllerOptions(options: IInputOptions): object {
      const controllerOptions = getDropdownControllerOptions(options);
      return { ...controllerOptions, ...{
            dataLoadCallback: this._dataLoadCallback.bind(this),
            selectorOpener: this,
            selectedKeys: options.selectedKeys || [],
            popupClassName: options.popupClassName || ((options.showHeader ||
                options.headerTemplate || options.headerContentTemplate) ?
                'controls-DropdownList__margin-head' : options.multiSelect ?
                    'controls-DropdownList_multiSelect__margin' :  'controls-DropdownList__margin') +
                ' theme_' + options.theme,
            allowPin: false,
            selectedItemsChangedCallback: this._prepareDisplayState.bind(this, options),
            openerControl: this
         }
      };
   }

   _getMenuPopupConfig(): IStickyPopupOptions {
      return {
         opener: this._children.infoboxTarget,
         templateOptions: {
            selectorDialogResult: this._selectorTemplateResult.bind(this)
         },
         eventHandlers: {
            onOpen: this._onOpen.bind(this),
            onClose: this._onClose.bind(this),
            onResult: this._onResult.bind(this)
         }
      };
   }

   _selectedItemsChangedHandler(items: Model[]): void|unknown {
      const text = this._getText(items[0], this._options) + this._getMoreText(items);
      this._notify('textValueChanged', [text]);
      const newSelectedKeys = this._getSelectedKeys(items, this._options.keyProperty);
      if (!isEqual(this._options.selectedKeys, newSelectedKeys) || this._options.task1178744737) {
         return this._notify('selectedKeysChanged', [newSelectedKeys]);
      }
   }

   _dataLoadCallback(items: RecordSet<Model>): void {
      this._countItems = items.getCount();
      if (this._options.emptyText) {
         this._countItems += 1;
      }

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(items);
      }
   }

   _prepareDisplayState(options: IInputOptions, items: Model[]): void {
      if (items.length) {
         this._selectedItems = items;
         this._needInfobox = options.readOnly && this._selectedItems.length > 1;
         this._item = items[0];
         this._isEmptyItem = isEmptyItem(this._item, options.emptyText, options.keyProperty);
         this._icon = this._isEmptyItem ? null : getPropValue(this._item, 'icon');
         this._text = this._getText(items[0], options);
         this._hasMoreText = this._getMoreText(items);
         this._tooltip = this._getTooltip(items, options.displayProperty);
      }
   }

   _handleMouseDown(event: SyntheticEvent<MouseEvent>): void {
      if (!isLeftMouseButton(event)) {
         return;
      }
      this.openMenu();
   }

   openMenu(popupOptions?: IStickyPopupOptions): void {
      const config = this._getMenuPopupConfig();
      this._controller.setMenuPopupTarget(this._container);

      this._controller.openMenu(Merge(config, popupOptions || {})).then((result) => {
         if (result) {
            this._selectedItemsChangedHandler(result);
         }
      });
   }

   protected _onResult(action: string, data: Model|Model[]): void {
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

   protected _itemClick(data: Model): void {
      const item = this._controller.getPreparedItem(data);
      const res = this._selectedItemsChangedHandler([item]);

      // dropDown must close by default, but user can cancel closing, if returns false from event
      if (res !== false) {
         this._controller.handleSelectedItems(item);
      }
   }

   protected _applyClick(data: Model[]): void {
      this._selectedItemsChangedHandler(data);
      this._controller.handleSelectedItems(data);
   }

   protected _selectorResult(data): void {
      this._controller.handleSelectorResult(data);
      this._selectedItemsChangedHandler(factory(data).toArray());
   }

   protected _selectorTemplateResult(event: Event, selectedItems: List<Model>): void {
      const result = this._notify('selectorCallback', [this._initSelectorItems, selectedItems]) || selectedItems;
      this._selectorResult(result);
   }

   private _getSelectedKeys(items: Model[], keyProperty: string): TKey[] {
      const keys = [];
      factory(items).each((item) => {
         keys.push(getPropValue(item, keyProperty));
      });
      return keys;
   }

   private _getTooltip(items: Model[], displayProperty: string): string {
      const tooltips = [];
      factory(items).each((item) => {
         tooltips.push(getPropValue(item, displayProperty));
      });
      return tooltips.join(', ');
   }

   private _getText(item: Model,
                    {emptyText, keyProperty, displayProperty}: Partial<IInputOptions>): string {
      let text = '';
      if (isEmptyItem(item, emptyText, keyProperty)) {
         text = prepareEmpty(emptyText);
      } else {
         text = getPropValue(item, displayProperty);
      }
      return text;
   }

   private _getMoreText(items: Model[]): string {
      let moreText = '';
      if (items.length > 1) {
         moreText = ', ' + rk('еще') + ' ' + (items.length - 1);
      }
      return moreText;
   }

   protected _deactivated(): void {
      this.closeMenu();
   }

   static _theme: string[] = ['Controls/dropdown', 'Controls/Classes'];

   static getDefaultOptions(): Partial<IBaseDropdownOptions> {
      return {
         iconSize: 's'
      };
   }
}
/**
 * @name Controls/_dropdown/Input#contentTemplate
 * @cfg {Function} Шаблон, который будет отображать вызываемый элемент.
 * @remark
 * Для определения шаблона вызовите базовый шаблон - "Controls/dropdown:inputDefaultContentTemplate".
 * Шаблон должен быть помещен в контрол с помощью тега <ws:partial> с атрибутом "template".
 * Содержимое можно переопределить с помощью параметра "contentTemplate".
 * Базовый шаблон Controls/dropdown:inputDefaultContentTemplate по умолчанию отображает только текст.
 * Для отображения иконки и текста используйте шаблон "Controls/dropdown:defaultContentTemplateWithIcon".
 * @demo Controls-demo/dropdown_new/Input/ContentTemplate/Index
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
 * @demo Controls-demo/dropdown_new/Input/MultiSelect/Simple/Index
 * @demo Controls-demo/dropdown_new/Input/MultiSelect/PinnedItems/Index
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
 * @event Происходит при изменении выбранных элементов.
 * @name Controls/_dropdown/Input#selectedKeysChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} keys Набор ключей выбранных элементов.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, выпадающий список не закроется.
 * По умолчанию, когда выбран пункт с иерархией, выпадающий список закрывается.
 * @example
 * В следующем примере создается список и устанавливается опция selectedKeys со значением [1, 2, 3], а также показано, как изменить сообщение, выведенное пользователю на основе выбора.
 * <pre class="brush: html; highlight: [3,4]">
 * <!-- WML -->
 * <Controls.dropdown:Input
 *     on:selectedKeysChanged="onSelectedKeysChanged()"
 *     selectedKeys="{{ _selectedKeys }}"/>
 *    <h1>{{ _message }}</h1>
 * </pre>
 * <pre class="brush: js;">
 * // JavaScript
 * _beforeMount: function() {
 *    this._selectedKeys = [1, 2, 3];
 * },
 * onSelectedKeysChanged: function(e, keys) {
 *    this._selectedKeys = keys; //We don't use binding in this example so we have to update state manually.
 *    if (keys.length > 0) {
 *       this._message = 'Selected ' + keys.length + ' items.';
 *    } else {
 *       this._message = 'You have not selected any items.';
 *    }
 * }
 * </pre>
 */

 /**
 * @name Controls/_dropdown/Input#fontSize
 * @cfg
 * @demo Controls-demo/dropdown_new/Input/FontSize/Index
 */