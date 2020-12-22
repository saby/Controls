import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_filterPopup/Panel/Dropdown/Dropdown');
import {List} from 'Types/collection';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';

   /**
    * Контрол, позволяющий выбрать значение из списка. Отображается в виде ссылки и используется на панели фильтров.
    * Текст ссылки отображает выбранные значения. Значения выбирают в выпадающем меню, которое по умолчанию скрыто.
    * 
    * @remark
    * Меню можно открыть кликом на контрол. Для работы единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
    *
    * Полезные ссылки:
    * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less переменные тем оформления}
    * 
    * @class Controls/_filterPopup/Panel/Dropdown
    * @extends Controls/_dropdown/Input
    * @public
    * @author Герасимов А.М.
    */

class FilterDropdown extends Control<IControlOptions> {
      protected _template: TemplateFunction = template;

      protected _selectedKeysChangedHandler(event: SyntheticEvent, keys: any[]): Boolean|undefined {
         return this._notify('selectedKeysChanged', [keys]);
      }

      protected _textValueChangedHandler(event: SyntheticEvent, text): void {
         this._notify('textValueChanged', [text]);
      }

      protected _selectorCallbackHandler(event: SyntheticEvent,
                                         initSelectorItems: List<Model>,
                                         selectedItems: List<Model>): {} {
         return this._notify('selectorCallback', [initSelectorItems, selectedItems]);
      }

      protected _resetHandler(): void {
         this._notify('visibilityChanged', [false]);
      }

      protected _dropDownOpen(event: SyntheticEvent<Event>): void {
         this._notify('dropDownOpen');
      }

      protected _dropDownClose(event: SyntheticEvent<Event>): void {
         this._notify('dropDownClose');
      }

      static _theme: string[] = ['Controls/filterPopup'];

      static getDefaultOptions(): object {
         return {
            displayProperty: 'title'
         };
      }
   }
export default FilterDropdown;
/**
 * @name Controls/_filterPopup/Panel/Dropdown#showCross
 * @cfg {Boolean} Показать крестик сброса рядом с выпадающим списком.
 * Используется для контрола в блоке "Отбираются".
 * По клику на крестик выпадающий список переместится в блок "Еще можно отобрать".
 * @default false
 * @example
 * <pre class="brush: html">
 * <Controls.filterPopup:Dropdown showCross="{{true}}"/>
 * </pre>
 */