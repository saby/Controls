import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_filterPopup/Panel/Lookup/Lookup');
import {EventUtils} from 'UI/Events';
import {Logger} from 'UI/Utils';
import {IPopupOptions} from 'Controls/popup';
import {ILookupOptions, Input} from 'Controls/lookup';
import {Register} from 'Controls/event';
import 'css!Controls/filterPopup';

type TKey = string|number|null;

interface IFilterPanelLookupOptions extends IControlOptions, ILookupOptions {
   caption: string;
   emptyText: string;
   lookupTemplateName: string;
}

/**
 * Метка с полем связи. Пока коллекция пуста - поле связи скрыто.
 *
 * @remark
 * Если вы используете внутри подсказки поля ввода ссылку на открытие справочника - вам понадобиться {@link Controls/lookup:Link}.
 * Если вы хотите сделать динамичную подсказку поля ввода, которая будет меняться в зависимости от выбранной коллекции, используйте {@link Controls/lookup:PlaceholderChooser}.
 * Если хотите расположить поле связи с кнопкой-ссылкой в одну строку, необходимо на корневой элемет навесить класс 'ws-flexbox'.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_filterPopup.less переменные тем оформления}
 *
 * @class Controls/_filterPopup/Panel/Lookup
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/interface:IInputPlaceholder
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/_interface/IInputTag
 * @mixes Controls/input:IValue
 * @mixes Controls/_interface/ISelectorDialog
 * @public
 * @author Герасимов А.М.
 *
 * @demo Controls-demo/Lookup/Index
 */
/*
 * Label with a Lookup. While the collection is empty - the Lookup is hidden.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">demo-example</a>.
 * If you use the link to open the directory inside the tooltip of the input field, you will need {@link Controls/lookup:Link}.
 * If you want to make a dynamic placeholder of the input field, which will vary depending on the selected collection, use {@link Controls/lookup:PlaceholderChooser}.
 *
 * @class Controls/_filterPopup/Panel/Lookup
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/interface:IHeight
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/_interface/IInputTag
 * @mixes Controls/input:IValue
 *
 * @public
 * @author Kapustin I.A.
 */
class Lookup extends Control<IFilterPanelLookupOptions> {
   protected _template: TemplateFunction = template;
   protected _notifyHandler: Function = EventUtils.tmplNotify;
   protected _passed: boolean = false;
   protected _caption: string = '';

   protected _children: {
      lookup: Input & Control,
      controlResize: Register
   };

   protected _beforeMount(options: IFilterPanelLookupOptions): void {
      this._caption = this._getCaption(options);
      this._passed = !!options.selectedKeys?.length;
   }

   protected _beforeUpdate(newOptions: IFilterPanelLookupOptions): void {
      if (this._options.caption !== newOptions.caption || newOptions.source !== this._options.source) {
         this._passed = false;
      }
      this._caption = this._getCaption(newOptions);
   }

   protected _afterUpdate(oldOptions: IFilterPanelLookupOptions): void {
      const lookup = this._getLookup();

      // if the first items were selected, call resize for Lookup
      if (!oldOptions.selectedKeys.length && this._options.selectedKeys.length) {
         this._children.controlResize.start();
         if (lookup) {
            lookup.activate();
         }
      }
   }

   showSelector(popupOptions: IPopupOptions): void {
      const lookup = this._getLookup();

      return lookup && lookup.showSelector(popupOptions);
   }

   protected _selectedKeysChanged(event: Event, keys: TKey[]): void {
      this._passed = true;
      this._notify('selectedKeysChanged', [keys]);
   }

   // when using Utils/tmplNotify, bubbling event comes with incorrect arguments to the filter panel
   // https://online.sbis.ru/opendoc.html?guid=88fed89c-9f87-440e-8549-aa6f468f7477
   protected _textValueChanged(event: Event, textValue: string): void {
      this._notify('textValueChanged', [textValue]);
   }

   private _getLookup(): Input & Control {
      if (typeof this._options.lookupTemplateName === 'string') {
         return this._children.lookup;
      } else {
         Logger.error('Option "Controls/_filterPopup/Panel/Lookup:lookupTemplateName" only supports string type', this);
      }
   }

   private _getCaption(options: IFilterPanelLookupOptions): string {
      let caption = options.caption;

      if (options.emptyText && !this._passed && !options.selectedKeys.length) {
         caption = options.emptyText;
      }

      return caption;
   }

   static getDefaultOptions(): Partial<IFilterPanelLookupOptions> {
      return {
         lookupTemplateName: 'Controls/lookup:Input'
      };
   }
}

Object.defineProperty(Lookup, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Lookup.getDefaultOptions();
   }
});

/**
 * @name Controls/_filterPopup/Panel/Lookup#caption
 * @cfg {String} Caption
 */

/**
 * @name Controls/_filterPopup/Panel/Lookup#emptyText
 * @cfg {String} Текст ссылки, который отображается до первого выбора записи в контролле.
 */

/**
 * @name Controls/_filterPopup/Panel/Lookup#lookupTemplateName
 * @cfg {String} Имя контрола с тем же интерфейсом, что и Lookup.
 * @default Controls/_lookup/Lookup
 * @example
 * <pre class="brush: html">
 * <Controls.filterPopup:Lookup lookupTempalteName="namePace/Lookup"/>
 * </pre>
 */

/*
   * @name Controls/_filterPopup/Panel/Lookup#lookupTemplateName
   * @cfg {String} Name of the control with same interface as Lookup.
   * @default Controls/_lookup/Lookup
   * @example
   * <pre>
   *   <Controls.filterPopup:Lookup lookupTempalteName="namePace/Lookup"/>
   * </pre>
   */

/**
 * @name Controls/_filterPopup/Panel/Lookup#lookupClassName
 * @cfg {String} Класс, который вешается на корневой элемент шаблона lookupTemplateName
 * @example
 * На корневой элемент шаблона "namePace/Lookup" навешивается класс "myClass"
 * <pre class="brush: html">
 * <Controls.filterPopup:Lookup lookupTempalteName="namePace/Lookup" lookupClassName="myClass"/>
 * </pre>
 */

export default Lookup;
