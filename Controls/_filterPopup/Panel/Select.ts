import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/Panel/Select/Select');
import {object} from 'Types/util';
   /**
    * Контрол, отображающий заданный набор элементов через разделитель.
    * 
    * @remark
    * Для работы с единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
    * 
    * Полезные ссылки:
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less">переменные тем оформления</a>
    * 
    * @class Controls/_filterPopup/Panel/Select
    * @extends Core/Control
    * @mixes Controls/_interface/ITextValue
    * @mixes Controls/_interface/IMultiSelectable
    * @control
    * @public
    * @author Герасимов А.М.
    */

   /*
    * Control that displays items through delimiter.
    *
    * To work with single selectedKeys option you can use control with {@link Controls/source:SelectedKey}.
    * @class Controls/_filterPopup/Panel/Select
    * @extends Core/Control
    * @control
    * @mixes Controls/_interface/ITextValue
    * @mixes Controls/_interface/IMultiSelectable
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @name Controls/_filterPopup/Panel/Select#items
    * @cfg {Array} Набор данных для отображения.
    */

   /*
    * @name Controls/_filterPopup/Panel/Select#items
    * @cfg {Array} Data to build the mapping.
    * Text is taken from the title field.
    */

   /**
    * @name Controls/_filterPopup/Panel/Select#keyProperty
    * @cfg {String} Имя свойства, уникально идентифицирующего элемент коллекции.
    */

   /*
    * @name Controls/_filterPopup/Panel/Select#keyProperty
    * @cfg {String} Name of the item property that uniquely identifies collection item.
    */

   /**
    * @name Controls/_filterPopup/Panel/Select#displayProperty
    * @cfg {String} Имя поля, значение которого отображается.
    * @default title
    */

   /*
    * @name Controls/_filterPopup/Panel/Select#displayProperty
    * @cfg {String} The name of the field whose value is displayed.
    * @default title
    */

   /**
    * @name Contorls/_filterPopup/Panel/Select#textValueProperty
    * @cfg {String} Имя поля, значение которого отображается в строке примененных фильтров и в истории.
    * Используется, если фильтр имеет разное текстовое представление для блоков "Отбираются" и "Еще можно отобрать"
    * @default textValue
    * @example
    * WML:
    * <pre>
    *    <Controls.filterPopup:Select items="{{_items}}" textValueProperty="text" keyProperty="id"/>
    * </pre>
    *
    * JS:
    * <pre>
    *     _beforeMount() {
    *         this._items = [
    *             {id: 1, title: 'For sale', text: 'For sale'},
    *             {id: 2, title: 'No', text: 'Not for sale'}
    *         ];
    *     }
    * </pre>
    */

   var FilterSelect = Control.extend({
      _template: template,

      _clickHandler: function(event, item) {
         const textValue = object.getPropertyValue(item, this._options.textValueProperty) || object.getPropertyValue(item, this._options.displayProperty);
         this._notify('textValueChanged', [textValue]);
         this._notify('selectedKeysChanged', [[object.getPropertyValue(item, this._options.keyProperty)]]);
      }

   });

   FilterSelect.getDefaultOptions = function() {
      return {
         displayProperty: 'title',
         textValueProperty: 'textValue'
      };
   };

   export = FilterSelect;

