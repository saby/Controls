define('Controls/Input/Dropdown',
   [
      'Core/Control',
      'wml!Controls/Input/Dropdown/Dropdown',
      'wml!Controls/Input/Dropdown/resources/defaultContentTemplate',
      'WS.Data/Utils',
      'WS.Data/Chain',
      'Controls/Dropdown/Util',
      'Core/helpers/Object/isEqual',
      'css!theme?Controls/Input/Dropdown/Dropdown'
   ],
   function(Control, template, defaultContentTemplate, Utils, Chain, dropdownUtils, isEqual) {
      /**
       * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
       * The full list of options is displayed when you click on the control.
       * <a href="/materials/demo-ws4-input-dropdown">Demo-example</a>.
       * @class Controls/Input/Dropdown
       * @extends Core/Control
       * @mixes Controls/interface/ISource
       * @mixes Controls/List/interface/IHierarchy
       * @mixes Controls/interface/IFilter
       * @mixes Controls/interface/INavigation
       * @mixes Controls/Input/interface/IValidation
       * @mixes Controls/interface/IMultiSelectable
       * @mixes Controls/Dropdown/interface/IFooterTemplate
       * @mixes Controls/Dropdown/interface/IHeaderTemplate
       * @mixes Controls/Input/interface/IDropdownEmptyText
       * @mixes Controls/Input/interface/IInputDropdown
       * @mixes Controls/interface/IDropdown
       * @mixes Controls/interface/IInputDropdown
       * @mixes Controls/interface/ITextValue
       * @control
       * @public
       * @author Красильников А.С.
       * @category Input
       * @demo Controls-demo/Input/Dropdown/DropdownPG
       */

      /**
       * @name Controls/Input/Dropdown#contentTemplate
       * @cfg {Function} Template that will be render calling element.
       */


      'use strict';

      var getPropValue = Utils.getItemPropertyValue.bind(Utils);

      var _private = {
         getSelectedKeys: function(items, keyProperty) {
            var keys = [];
            Chain(items).each(function(item) {
               keys.push(getPropValue(item, keyProperty));
            });
            return keys;
         }
      };

      var DropdownList = Control.extend({
         _template: template,
         _defaultContentTemplate: defaultContentTemplate,
         _text: '',

         _beforeMount: function() {
            this._setText = this._setText.bind(this);
         },

         _afterMount: function(options) {
            /* Updating the text in the header.
            Since the text is set after loading source, the caption stored old value */
            if (options.showHeader && options.caption !== this._text) {
               this._forceUpdate();
            }
         },

         _afterUpdate: function(newOptions) {
            if (!isEqual(newOptions.selectedKeys, this._options.selectedKeys)) {
               this._notify('textValueChanged', [this._text]);
            }
         },

         _selectedItemsChangedHandler: function(event, items) {
            this._notify('selectedKeysChanged', [_private.getSelectedKeys(items, this._options.keyProperty)]);
         },

         _setText: function(items) {
            if (items.length) {
               this._isEmptyItem = getPropValue(items[0], this._options.keyProperty) === null || items[0] === null;
               if (this._isEmptyItem) {
                  this._text = dropdownUtils.prepareEmpty(this._options.emptyText);
                  this._icon = null;
               } else {
                  this._text = getPropValue(items[0], this._options.displayProperty);
                  this._icon = getPropValue(items[0], 'icon');
               }
               if (items.length > 1) {
                  this._text += ' и еще' + (items.length - 1);
               }
            }
         }
      });

      return DropdownList;
   });
