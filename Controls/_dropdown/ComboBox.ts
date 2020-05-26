import rk = require('i18n!Controls');
import Control = require('Core/Control');
import template = require('wml!Controls/_dropdown/ComboBox/ComboBox');
import Utils = require('Types/util');
import dropdownUtils = require('Controls/_dropdown/Util');
import tmplNotify = require('Controls/Utils/tmplNotify');

var getPropValue = Utils.object.getPropertyValue.bind(Utils);

var _private = {
   popupVisibilityChanged: function (state) {
      this._isOpen = state;
      this._forceUpdate();
   },
   //FIXME delete after https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
   getContainerNode: function(container:[HTMLElement]|HTMLElement):HTMLElement {
      return container[0] || container;
   }
};

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

var ComboBox = Control.extend({
   _template: template,
   _isOpen: false,
   _notifyHandler: tmplNotify,

   _beforeMount: function (options) {
      this._onClose = _private.popupVisibilityChanged.bind(this, false);
      this._onOpen = _private.popupVisibilityChanged.bind(this, true);
      this._placeholder = options.placeholder;
      this._value = options.value;
      this._setText = this._setText.bind(this);
   },

   _afterMount: function () {
      this._targetPoint = {
         vertical: 'bottom'
      };
      this._width = _private.getContainerNode(this._container).offsetWidth;
      this._forceUpdate();
   },

   _beforeUpdate: function () {
      var containerNode = _private.getContainerNode(this._container);

      if (this._width !== containerNode.offsetWidth) {
         this._width = containerNode.offsetWidth;
      }
   },

   _selectedItemsChangedHandler: function (event, selectedItems) {
      var key = getPropValue(selectedItems[0], this._options.keyProperty);
      this._setText(selectedItems);
      this._notify('valueChanged', [this._value]);
      this._notify('selectedKeyChanged', [key]);
      this._isOpen = false;
   },

   _setText: function (selectedItems) {
      this._isEmptyItem = getPropValue(selectedItems[0], this._options.keyProperty) === null || selectedItems[0] === null;
      if (this._isEmptyItem) {
         this._value = '';
         this._placeholder = dropdownUtils.prepareEmpty(this._options.emptyText);
      } else {
         this._value = String(getPropValue(selectedItems[0], this._options.displayProperty) || '');
         this._placeholder = this._options.placeholder;
      }
   },

   _deactivated: function() {
      this.closeMenu();
   },

   openMenu(popupOptions?: object): void {
      this._children.controller.openMenu(popupOptions);
   },

   closeMenu(): void {
      this._children.controller.closeMenu();
   }

});

ComboBox.getDefaultOptions = function () {
   return {
      placeholder: rk('Выберите') + '...'
   };
};

ComboBox._private = _private;

ComboBox._theme = ['Controls/dropdown'];

export = ComboBox;
