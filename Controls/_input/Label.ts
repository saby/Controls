import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ICaption, ICaptionOptions, IFontSize, IFontSizeOptions,} from 'Controls/interface';
import * as LabelTemplate from 'wml!Controls/_input/Label/Label';

export interface ILabelOptions extends IControlOptions, ICaptionOptions, IFontSizeOptions {
   required?: boolean;
   underline?: string | null;
   href?: string;
}

/**
 * Текстовая метка для поля ввода.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Label
 * @extends Core/Control
 *
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IFontSize
 *
 * @public
 * @demo Controls-demo/Input/Labels/Index
 *
 * @author Красильников А.С.
 */

/*
 * Represents the text label for a control.
 *
 * @class Controls/_input/Label
 * @extends Core/Control
 *
 * @mixes Controls/_interface/ICaption
 *
 * @public
 * @demo Controls-demo/Label/Label
 *
 * @author Красильников А.С.
 */

/**
 * @name Controls/_input/Label#required
 * @cfg {Boolean} В значении true справа от метки отображается символ "*" (поле обязательно к заполнению).
 */

/*
 * @name Controls/_input/Label#required
 * @cfg {Boolean} Determines whether the label can be displayed as required.
 */

/**
 * @name Controls/_input/Label#underline
 * @cfg {String} Стиль декоративной линии, отображаемой для текста метки.
 * @variant hovered
 * @variant fixed
 * @variant none
 * @default none
 */

/*
 * @name Controls/_input/Label#underline
 * @cfg {String} Display underline style of the label.
 * @variant hovered
 * @variant fixed
 * @variant none
 */

/**
 * @name Controls/_input/Label#href
 * @cfg {String} При клике по метке пользователь переходит по ссылке, URL которой задан в опции.
 */

/*
 * @name Controls/_input/Label#href
 * @cfg {String} Contains a URL or a URL fragment that the hyperlink points to.
 */
class Label extends Control<ILabelOptions> implements ICaption, IFontSize {
   protected _template: TemplateFunction = LabelTemplate;

   readonly '[Controls/_interface/ICaption]': true;
   readonly '[Controls/_interface/IFontSize]': true;

   static _theme: string[] = ['Controls/input', 'Controls/Classes'];

   static getDefaultOptions(): object {
      return {
         underline: 'none'
      };
   }


   static getOptionTypes(): object {
      return {
         href: EntityDescriptor(String),
         //Caption задается текстом, либо шаблоном. Шаблон приходит в виде объекта
         caption: EntityDescriptor(Object, String).required(),
         underline: EntityDescriptor(String).oneOf([
            'none',
            'fixed',
            'hovered'
         ]),
         required: EntityDescriptor(Boolean)
      };
   }
}

export default Label;
