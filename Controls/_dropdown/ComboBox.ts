import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/ComboBox/ComboBox');
import Utils = require('Types/util');
import dropdownUtils = require('Controls/_dropdown/Util');
import tmplNotify = require('Controls/Utils/tmplNotify');
import Dropdown = require('Controls/_dropdown/Dropdown');
import _Controller = require('Controls/_dropdown/_Controller');
import {SyntheticEvent} from "Vdom/Vdom";

var getPropValue = Utils.object.getPropertyValue.bind(Utils);

/**
 * Контрол, позволяющий выбрать значение из списка. Полный список параметров отображается при нажатии на контрол.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FCombobox%2FComboboxVDom">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/combobox/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdown.less">переменные тем оформления dropdown</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdownPopup.less">переменные тем оформления dropdownPopup</a>
 *
 * @class Controls/_dropdown/ComboBox
 * @extends Core/Control
 * @implements Controls/_interface/ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/_interface/IFilter
 * @implements Controls/_interface/ISingleSelectable
 * @implements Controls/interface/IDropdownEmptyText
 * @implements Controls/interface/IInputPlaceholder
 * @implements Controls/interface/IDropdown
 * @implements Controls/_interface/INavigation
 * @control
 * @public
 * @category Input
 * @author Золотова Э.Е.
 * @demo Controls-demo/Input/ComboBox/ComboBoxPG
 */

/*
 * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
 * The full list of options is displayed when you click on the control.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FCombobox%2FComboboxVDom">Demo-example</a>.
 * @class Controls/_dropdown/ComboBox
 * @extends Core/Control
 * @implements Controls/_interface/ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/_interface/IFilter
 * @implements Controls/_interface/ISingleSelectable
 * @implements Controls/interface/IDropdownEmptyText
 * @implements Controls/_input/interface/IBase
 * @implements Controls/interface/IDropdown
 * @control
 * @public
 * @category Input
 * @author Золотова Э.Е.
 * @demo Controls-demo/Input/ComboBox/ComboBoxPG
 */

/**
 * @event Controls/_dropdown/ComboBox#valueChanged Происходит при изменении отображаемого значения контрола.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} value Отображаемое значение контрола.
 * @remark
 * Событие используется в качестве реакции на изменения, вносимые пользователем.
 * @example
 * WML:
 * <pre>
 *     <Controls.dropdown:ComboBox
 *                on:valueChanged="_valueChangedHandler()"
 *                source="{{_source}}"/>
 * </pre>
 * TS:
 *    private _valueChangedHandler(event, value) {
 *        this._text = value;
 *    }
 */

class ComboBox extends Dropdown{
   protected _template: TemplateFunction = template;
   protected _isOpen: boolean =  false;
   protected _notifyHandler: Function = tmplNotify;

   _beforeMount(options, recievedState) {
      this._onClose = this._popupVisibilityChanged.bind(this, false);
      this._onOpen = this._popupVisibilityChanged.bind(this,true);
      this._placeholder = options.placeholder;
      this._value = options.value;
      this._setText = this._setText.bind(this);
      this._controller = new _Controller(this._getControllerOptions(options));

      return super._beforeMount(options, recievedState);
   }

   _afterMount() {
      this._targetPoint = {
         vertical: 'bottom'
      };
      this._width = this._getContainerNode(this._container).offsetWidth;
      this._forceUpdate();
      this._controller.registerScrollEvent(this);
   }

   _beforeUpdate(options) {
      var containerNode = this._getContainerNode(this._container);

      if (this._width !== containerNode.offsetWidth) {
         this._width = containerNode.offsetWidth;
      }
      this._controller.update(this._getControllerOptions(options));
   }

   _getControllerOptions(options) {
      return { ...options, ...{
            selectedKeys: [options.selectedKey],
            marker: false,
            popupClassName: (options.popupClassName ? options.popupClassName + ' controls-ComboBox-popup' : 'controls-ComboBox-popup') + ' controls-ComboBox-popup_theme-' + options.theme,
            typeShadow: 'suggestionsContainer',
            close: this._onClose,
            open: this._onOpen,
            allowPin: false,
            selectedItemsChangedCallback: this._setText,
            theme: options.theme,
            notifyEvent: this._notifyComboboxEvent.bind(this),
            notifySelectedItemsChanged: this._selectedItemsChangedHandler.bind(this),
            itemPadding: {
               right: 'menu-xs',
               left: 'menu-xs'
            },
            width: this._width,
            targetPoint: this._targetPoint
         }
      };
   }

   _selectedItemsChangedHandler(selectedItems, event) {
      var key = getPropValue(selectedItems[0], this._options.keyProperty);
      this._setText(selectedItems);
      this._notify('valueChanged', [this._value]);
      this._notify('selectedKeyChanged', [key]);
      this._isOpen = false;
   }

   _setText(selectedItems) {
      this._isEmptyItem = getPropValue(selectedItems[0], this._options.keyProperty) === null || selectedItems[0] === null;
      if (this._isEmptyItem) {
         this._value = '';
         this._placeholder = dropdownUtils.prepareEmpty(this._options.emptyText);
      } else {
         this._value = String(getPropValue(selectedItems[0], this._options.displayProperty) || '');
         this._placeholder = this._options.placeholder;
      }
   }

   openMenu(popupOptions?: object): void {
      this._controller.openMenu(popupOptions);
   }

   closeMenu(): void {
      this._controller.closeMenu();
   }

   _notifyComboboxEvent(eventName, data, additionData) {
      return this._notify(eventName, [data, additionData]);
   }

   _handleClick(event: SyntheticEvent): void {
      // stop bubbling event, so the list does not handle click event.
      event.stopPropagation();
   }

   _handleMouseDown(event: SyntheticEvent): void {
      this._controller.handleMouseDownOnMenuPopupTarget(this._container);
   }

   _handleMouseEnter(event: SyntheticEvent): void {
      this._controller.handleMouseEnterOnMenuPopupTarget();
   }

   _handleMouseLeave(event: SyntheticEvent): void {
      this._controller.handleMouseLeaveMenuPopupTarget();
   }

   _handleKeyDown(event: SyntheticEvent): void {
      this._controller.handleKeyDown(event);
   }

   _beforeUnmount(): void {
      this._controller.destroy();
   }

   private _popupVisibilityChanged(state) {
      this._isOpen = state;
      this._forceUpdate();
   }

   //FIXME delete after https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
   private _getContainerNode(container:[HTMLElement]|HTMLElement):HTMLElement {
      return container[0] || container;
   }
}

ComboBox.getDefaultOptions = function () {
   return {
      placeholder: rk('Выберите') + '...'
   };
};

ComboBox._theme = ['Controls/dropdown'];

export = ComboBox;
