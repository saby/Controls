import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_lookup/Button/SelectorButton';
import {default as BaseLookup, ILookupOptions} from 'Controls/_lookup/BaseLookup';
import showSelector from 'Controls/_lookup/showSelector';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import {EventUtils} from 'UI/Events';
import {List} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
// @ts-ignore
import * as itemTemplate from 'wml!Controls/_lookup/SelectedCollection/ItemTemplate';
import {IValidationStatusOptions, ValidationStatus} from '../_interface/IValidationStatus';
// @ts-ignore
import rk = require('i18n!Controls');
import {IHashMap} from 'Types/declarations';

/**
 * Кнопка-ссылка с возможностью выбора значений из справочника.
 *
 * @remark
 * Выбранные значения отображаются в виде текста с кнопкой удаления.
 * Поддерживает одиночный и множественный выбор.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/directory/lookup/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_lookup.less переменные тем оформления}
 *
 *
 * @class Controls/_lookup/Button
 * @extends Core/Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/_interface/ISelectorDialog
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/ITextValue
 *
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Lookup/Selector/Index
 */
/*
 * Button link with the specified text, on clicking on which a selection window opens.
 *
 * @class Controls/_lookup/Button
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISource
 *
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Buttons/SelectorButtonPG
 */
/*
 * @name Controls/_lookup/Button#showSelectorCaption
 * @cfg {String} Заголовок кнопки, открывающей окно выбора записей из справочника
 * @example
 * <pre class="brush: html">
 * <Controls.lookup:Selector
 *    source="{{_sourceButton}}"
 *    displayProperty="title"
 *    keyProperty="id"
 *    showSelectorCaption="+компания"
 *    caption="Выберите компанию">
 * </Controls.lookup:Selector>
 * </pre>
 */

export interface ISelectorButtonOptions extends IControlOptions, IValidationStatusOptions, ILookupOptions {
   fontColorStyle?: string;
   fontSize?: string;
   buttonStyle: string;
   maxVisibleItems: number;
   itemTemplate: TemplateFunction;
   showSelectorCaption: string;
}

export default class Button extends BaseLookup<ISelectorButtonOptions> {
   protected _template: TemplateFunction = template;
   protected _notifyHandler: Function = EventUtils.tmplNotify;

   showSelector(popupOptions?: IStackPopupOptions): void {
      return showSelector(this, popupOptions, this._options.multiSelect);
   }

   protected _reset(): void {
      this._updateItems(new List());
   }

   protected _itemClickHandler(event: SyntheticEvent<Event>, item: Model): void {
      this._notify('itemClick', [item]);

      if (!this._options.readOnly && !this._options.multiSelect) {
         this._showSelector();
      }
   }

   protected _removeItemHandler(event: SyntheticEvent, item: Model): void {
      this._removeItem(item);
   }

   protected _showSelectorHandler(): void {
      this._showSelector();
   }

   protected _openInfoBox(event: SyntheticEvent<Event>, config: IHashMap<unknown>): void {
      config.width = this._container.offsetWidth;
   }

   protected _inheritorBeforeMount(options: ILookupOptions): void {
      return undefined;
   }

   protected _inheritorBeforeUpdate(options: ILookupOptions): void {
      return undefined;
   }

   protected _itemsChanged(): void {
      return undefined;
   }

   static getDefaultOptions = (): ISelectorButtonOptions => {
      const buttonOptions = {
         fontColorStyle: 'link',
         fontSize: 'm',
         buttonStyle: 'secondary',
         maxVisibleItems: 7,
         itemTemplate,
         showSelectorCaption: `+${rk('еще')}`,
         validationStatus: 'valid' as ValidationStatus
      };
      const baseOptions = BaseLookup.getDefaultOptions();
      return {...buttonOptions, ...baseOptions} as ISelectorButtonOptions;
   }
}
