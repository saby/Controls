import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {
    ICaption,
    ICaptionOptions,
    IFontSize,
    IFontSizeOptions,
    IHref,
    IHrefOptions,
    IUnderlineOptions
} from 'Controls/interface';
import * as LabelTemplate from 'wml!Controls/_input/Label/Label';
import 'css!Controls/input';

export interface ILabelOptions extends IControlOptions, ICaptionOptions, IFontSizeOptions, IHrefOptions, IUnderlineOptions {
    required?: boolean;
}

/**
 * Текстовая метка для поля ввода.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Label
 * @extends UI/Base:Control
 *
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IUnderline
 * @mixes Controls/interface:ICaption
 * @mixes Controls/interface:IHref
 *
 * @public
 * @demo Controls-demo/Input/Label/Index
 *
 * @author Красильников А.С.
 */
class Label extends Control<ILabelOptions> implements ICaption, IFontSize, IHref {
    protected _template: TemplateFunction = LabelTemplate;

    readonly '[Controls/_interface/IHref]': boolean = true;
    readonly '[Controls/_interface/ICaption]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;

    static getDefaultOptions(): object {
        return {
            underline: 'none'
        };
    }

    static getOptionTypes(): object {
        return {
            href: EntityDescriptor(String),
            // Caption задается текстом, либо шаблоном. Шаблон приходит в виде объекта
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

Object.defineProperty(Label, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Label.getDefaultOptions();
   }
});

export default Label;

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
 * @default none
 */
