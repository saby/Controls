import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/ComboBox/ComboBox');
import * as Utils from 'Types/util';
import {prepareEmpty, loadItems} from 'Controls/_dropdown/Util';
import {EventUtils} from 'UI/Events';
import Controller from 'Controls/_dropdown/_Controller';
import {BaseDropdown, DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ISingleSelectableOptions, IBorderStyleOptions, IValidationStatusOptions, IInputPlaceholder,
   IInputPlaceholderOptions, IContrastBackgroundOptions, IContrastBackground} from 'Controls/interface';
import {IBaseDropdownOptions} from 'Controls/_dropdown/interface/IBaseDropdown';
import getDropdownControllerOptions from 'Controls/_dropdown/Utils/GetDropdownControllerOptions';
import {IStickyPopupOptions} from 'Controls/popup';
import * as Merge from 'Core/core-merge';
import {isLeftMouseButton} from 'Controls/popup';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import 'css!Controls/dropdown';
import 'css!Controls/CommonClasses';

type THorizontalPadding = 'xs' | 'null';

interface IComboboxOptions extends IBaseDropdownOptions, ISingleSelectableOptions, IBorderStyleOptions,
    IValidationStatusOptions, IInputPlaceholderOptions, IContrastBackgroundOptions {
   value?: string;
   horizontalPadding: THorizontalPadding;
}

const getPropValue = Utils.object.getPropertyValue.bind(Utils);

/**
 * Контрол, позволяющий выбрать значение из списка. Полный список параметров отображается при нажатии на контрол.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Fdropdown_new%2FCombobox%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/dropdown-menu/combobox/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_dropdown.less переменные тем оформления dropdown}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_dropdownPopup.less переменные тем оформления dropdownPopup}
 *
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/dropdown:IBaseDropdown
 * @implements Controls/menu:IMenuBase
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/interface:ISingleSelectable
 * @implements Controls/interface:IInputPlaceholder
 * @implements Controls/input:ITag
 * @implements Controls/interface:IValidationStatus
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IHeight
 * @implements Controls/input:IBorderVisibility
 *
 * @public
 * @author Золотова Э.Е.
 * @demo Controls-demo/dropdown_new/Combobox/Source/Index
 */

/*
 * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
 * The full list of options is displayed when you click on the control.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FCombobox%2FComboboxVDom">Demo-example</a>.
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/interface:ISingleSelectable
 * @implements Controls/input:IBase
 *
 * @public
 * @author Золотова Э.Е.
 * @demo Controls-demo/dropdown_new/Combobox/Source/Index
 */

class ComboBox extends BaseDropdown implements IInputPlaceholder, IContrastBackground {
   protected _template: TemplateFunction = template;
   protected _notifyHandler: Function = EventUtils.tmplNotify;
   protected _controller: Controller;
   protected _borderStyle: string = '';
   protected _countItems: number;
   protected _readOnly: boolean;
   protected _selectedItem: Model;
   protected _isEmptyItem: boolean;
   protected _value: string;
   protected _placeholder: string | Function;
   protected _horizontalPadding: string;

   _beforeMount(options: IComboboxOptions,
                context: object,
                receivedState: DropdownReceivedState): Promise<void | DropdownReceivedState> {
      this._placeholder = options.placeholder;
      this._value = options.value;
      this._readOnly = options.readOnly;
      this._updateHorizontalPadding(options);
      this._targetPoint = {
         vertical: 'bottom'
      };

      this._controller = new Controller(this._getControllerOptions(options));
      this._borderStyle = this._getBorderStyle(options.borderStyle, options.validationStatus);
      return loadItems(this._controller, receivedState, options);
   }

   protected _afterMount(options: IComboboxOptions): void {
      if (this._countItems === 1) {
         if (this._selectedItem.get(options.keyProperty) !== options.selectedKey) {
            this._selectedItemsChangedHandler([this._selectedItem]);
         }
      }
   }

   protected _beforeUpdate(newOptions: IComboboxOptions): void {
      if (newOptions.readOnly !== this._options.readOnly) {
         this._readOnly = this._getReadOnly(newOptions.readOnly);
      }
      if (newOptions.contrastBackground !== this._options.contrastBackground ||
          newOptions.horizontalPadding !== this._options.horizontalPadding) {
         this._updateHorizontalPadding(newOptions);
      }
      this._controller.update(this._getControllerOptions(newOptions));
      this._borderStyle = this._getBorderStyle(newOptions.borderStyle, newOptions.validationStatus);
   }

   _getControllerOptions(options: IComboboxOptions): object {
      const controllerOptions = getDropdownControllerOptions(options);
      return { ...controllerOptions, ...{
            selectedKeys: [options.selectedKey],
            markerVisibility: 'hidden',
            dataLoadCallback: this._dataLoadCallback.bind(this, options),
            popupClassName: (options.popupClassName ? options.popupClassName + ' controls-ComboBox-popup' : 'controls-ComboBox-popup'),
            typeShadow: 'suggestionsContainer',
            close: this._onClose,
            open: this._onOpen,
            allowPin: false,
            selectedItemsChangedCallback: this._setText.bind(this, options),
            theme: options.theme,
            itemPadding: {
               right: 'menu-s',
               left: 'menu-s'
            },
            targetPoint: this._targetPoint,
            openerControl: this,
            readOnly: this._readOnly
         }
      };
   }

   _getMenuPopupConfig(): IStickyPopupOptions {
      return {
         templateOptions: {
            width: this._getContainerNode(this._container).offsetWidth
         },
         eventHandlers: {
            onOpen: this._onOpen.bind(this),
            onClose: this._onClose.bind(this),
            onResult: this._onResult.bind(this)
         }
      };
   }

   _dataLoadCallback(options: IComboboxOptions, items: RecordSet<Model>): void {
      this._countItems = items.getCount();
      if (this._countItems === 1) {
         this._selectedItem = items.at(0);
      }
      if (this._countItems && options.emptyText) {
         this._countItems += 1;
      }
      const readOnly = this._getReadOnly(options.readOnly);
      if (readOnly !== this._readOnly) {
         this._readOnly = readOnly;
         this._controller.update(this._getControllerOptions(options));
      }

      if (options.dataLoadCallback) {
         options.dataLoadCallback(items);
      }
   }

   _getReadOnly(readOnly: boolean): boolean {
      return this._countItems < 2 || readOnly;
   }

   _selectedItemsChangedHandler(selectedItems): void {
      const key = getPropValue(selectedItems[0], this._options.keyProperty);
      this._setText(this._options, selectedItems);
      this._notify('valueChanged', [this._value]);
      this._notify('selectedKeyChanged', [key]);
   }

   _setText({emptyText, emptyKey, keyProperty, displayProperty, placeholder}: Partial<IComboboxOptions>,
            selectedItems): void {
      this._isEmptyItem = getPropValue(selectedItems[0], keyProperty) === emptyKey || selectedItems[0] === null;
      if (this._isEmptyItem && emptyText) {
         this._value = '';
         this._placeholder = prepareEmpty(emptyText);
      } else {
         this._value = String(getPropValue(selectedItems[0], displayProperty) ?? '');
         this._placeholder = placeholder;
      }
   }

   _handleMouseDown(event: SyntheticEvent<MouseEvent>): void {
      if (!isLeftMouseButton(event)) {
         return;
      }
      if (this._isOpened) {
         this._controller.closeMenu();
      } else {
         this.openMenu();
      }
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

   protected _onResult(action: string, data): void {
      if (action === 'itemClick') {
         const item = this._controller.getPreparedItem(data);
         this._selectedItemsChangedHandler([item]);
         this._controller.handleSelectedItems(item);
      }
   }

   protected _deactivated(event: SyntheticEvent<Event>): void {
      // если фокус ушел в меню, не закрываем его
      // TODO https://online.sbis.ru/opendoc.html?guid=b34ba2ef-fec0-42df-87d8-77541ec82c34
      if (event.nativeEvent.relatedTarget &&
          !event.nativeEvent.relatedTarget?.closest('.controls-Menu__popup') && this._options.closeMenuOnOutsideClick) {
         this.closeMenu();
      }
   }

   private _updateHorizontalPadding(options: IComboboxOptions): void {
      let padding;
      if (options.horizontalPadding) {
         padding = options.horizontalPadding;
      } else if (options.contrastBackground) {
         padding = 'xs';
      } else {
         padding = 'null';
      }
      this._horizontalPadding = padding;
   }

   //FIXME delete after https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
   private _getContainerNode(container:[HTMLElement]|HTMLElement): HTMLElement {
      return container[0] || container;
   }

   private _getBorderStyle(borderStyle: string, validationStatus: string): string {
      if (borderStyle && validationStatus === 'valid') {
         return  borderStyle;
      }
      return validationStatus;
   }

   static getDefaultOptions(): object {
      return {
         borderVisibility: 'partial',
         placeholder: rk('Выберите') + '...',
         validationStatus: 'valid',
         textAlign: 'left',
         inlineHeight: 'default',
         fontSize: 'm',
         fontColorStyle: 'default',
         tooltip: '',
         emptyKey: null,
         contrastBackground: false,
         closeMenuOnOutsideClick: true
      };
   }
}

Object.defineProperty(ComboBox, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ComboBox.getDefaultOptions();
   }
});

export = ComboBox;
/**
 * @event Происходит при изменении отображаемого значения контрола.
 * @name Controls/_dropdown/ComboBox#valueChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} value Отображаемое значение контрола.
 * @remark
 * Событие используется в качестве реакции на изменения, вносимые пользователем.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:ComboBox
 *     on:valueChanged="_valueChangedHandler()"
 *     source="{{_source}}"/>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * private _valueChangedHandler(event, value) {
 *     this._text = value;
 * }
 * </pre>
 */
