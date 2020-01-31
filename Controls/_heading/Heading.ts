import{Control, IControlOptions, TemplateFunction} from 'UI/Base';
import headingTemplate = require('wml!Controls/_heading/Heading/Heading');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ITooltip, ITooltipOptions, ICaption, ICaptionOptions, IFontColorStyle, IFontColorStyleOptions, IFontSize, IFontSizeOptions} from 'Controls/interface';

export interface IHeadingOptions extends IControlOptions, ICaptionOptions, ITooltipOptions, IFontColorStyleOptions, IFontSizeOptions {

}

   /**
    * Простой заголовок с поддержкой различных стилей отображения и размеров.
    * @remark
    * Может использоваться самостоятельно или в составе сложных заголовков, состоящих из {@link Controls/heading:Separator} и {@link Controls/heading:Counter}.
    *
    * <a href="/materials/demo-ws4-header-separator">Демо-пример</a>.
    *
    *
    * @class Controls/_heading/Heading
    * @extends Core/Control
    * @control
    * @public
    * @author Красильников А.С.
    * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
    *
    * @mixes Controls/_interface/ITooltip
    * @mixes Controls/_interface/ICaption
    * @mixes Controls/_interface/IFontColorStyle
    * @mixes Controls/_interface/IFontSize
    */

   /*
    * Heading with support different display styles and sizes. Can be used independently or as part of complex headings(you can see it in <a href="/materials/demo-ws4-header-separator">Demo-example</a>) consisting of a <a href="/docs/js/Controls/_heading/Counter/?v=3.18.500">counter</a>, a <a href="/docs/js/Controls/_heading/Separator/?v=3.18.500">header-separator</a> and a <a href="/docs/js/Controls/Button/Separator/?v=3.18.500">button-separator</a>.
    *
    * <a href="/materials/demo-ws4-header-separator">Demo-example</a>.
    *
    *
    * @class Controls/_heading/Heading
    * @extends Core/Control
    * @control
    * @public
    * @author Красильников А.С.
    * @demo Controls-demo/Heading/Title/SizesAndStyles/Index
    *
    * @mixes Controls/_interface/ITooltip
    * @mixes Controls/_interface/ICaption
    * @mixes Controls/_interface/IFontColorStyle
    * @mixes Controls/_interface/IFontSize
    * @mixes Controls/_heading/Heading/HeadingStyles
    */

const mapFontSize = {s: 'm', m: 'l', l: '3xl', xl: '4xl'};
const mapFontColorStyle = {info: 'label', primary: 'primary', secondary: 'secondary'};
class Header extends Control<IHeadingOptions> implements ICaption, ITooltip, IFontColorStyle, IFontSize {
   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = headingTemplate;
   protected _fontSize: string;
   protected _fontColorStyle: string;
   protected _stringCaption: boolean;


   private _prepareOptions(options: IHeadingOptions): void {
      if (options.size) {
         this._fontSize = mapFontSize[options.size];
      } else {
         this._fontSize = options.fontSize;
      }
      if (options.style) {
         this._fontColorStyle = mapFontColorStyle[options.style];
      } else {
         this._fontColorStyle = options.fontColorStyle;
      }
      this._stringCaption = typeof options.caption === 'string';
   }

   protected _beforeMount(options: IHeadingOptions): void {
      this._prepareOptions(options);
   }

   protected _beforeUpdate(options: IHeadingOptions): void {
      this._prepareOptions(options);
   }

   static _theme: string[] = ['Controls/heading', 'Controls/Classes'];

   static getDefaultOptions(): object {
      return {
         fontColorStyle: 'secondary',
         fontSize: 'l',
         theme: 'default'
      };
   }

   static getOptionTypes(): object {
      return {
         //Caption задается текстом, либо шаблоном, либо разметкой. Разметка приходит в виде объекта
         caption: EntityDescriptor(Object, String)
      };
   }

   '[Controls/_interface/ITooltip]': true;
   '[Controls/_interface/ICaption]': true;
}

export default Header;
