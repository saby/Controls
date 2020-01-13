import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/Panel/Dropdown/Dropdown');
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!theme?Controls/filterPopup';
   /**
    * Контрол, позволяющий выбрать значение из списка. Отображается в виде ссылки и используется на панели фильтров.
    * Текст ссылки отображает выбранные значения. Значения выбирают в выпадающем меню, которое по умолчанию скрыто.
    * Меню можно открыть кликом на контрол. Для работы единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
    *
    * @class Controls/_filterPopup/Panel/Dropdown
    * @extends Controls/_dropdown/Input
    * @control
    * @public
    * @author Герасимов А.М.
    */

   /*
    * Input for selection from the list of options with cross.
    *
    * To work with single selectedKeys option you can use control with {@link Controls/source:SelectedKey}.
    *
    * @class Controls/_filterPopup/Panel/Dropdown
    * @extends Controls/_dropdown/Input
    * @control
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @name Controls/_filterPopup/Panel/Dropdown#showCross
    * @cfg {Boolean} Показать крестик сброса рядом с выпадающим списком.
    * Используется для контрола в блоке "Отбираются".
    * По клику на крестик выпадающий список переместится в блок "Еще можно отобрать".
    * @default false
    * @example
    * <pre>
    *     <Controls.filterPopup:Dropdown showCross="{{true}}"/>
    * </pre>
    */

   /*
    * @name Controls/_filterPopup/Panel/Dropdown#showCross
    * @cfg {Boolean} Show reset button near dropdown. If you click on this button, dropdown will hide.
    * @default false
    * @example
    * <pre>
    *     <Controls.filterPopup:Dropdown showCross="{{true}}"/>
    * </pre>
    */

   var FilterDropdown = Control.extend({
      _template: template,

      _selectedKeysChangedHandler: function(event, keys:Array):Boolean|undefined {
         return this._notify('selectedKeysChanged', [keys]);
      },

      _textValueChangedHandler: function(event, text) {
         this._notify('textValueChanged', [text]);
      },

      _resetHandler: function() {
         this._notify('visibilityChanged', [false]);
      },

      _dropDownOpen(event: SyntheticEvent<Event>): void {
         this._notify('dropDownOpen');
      },

      _dropDownClose(event: SyntheticEvent<Event>): void {
         this._notify('dropDownClose');
      }

   });

   FilterDropdown.getDefaultOptions = function() {
      return {
         displayProperty: 'title'
      };
   };

   export = FilterDropdown;