import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ICaption, ICaptionOptions, IFontSize, IFontSizeOptions, IHref, IHrefOptions} from 'Controls/interface';
import * as LabelTemplate from 'wml!Controls/_input/Label/Label';

export interface ILabelOptions extends IControlOptions, ICaptionOptions, IFontSizeOptions, IHrefOptions {
    required?: boolean;
    underline?: string | null;
}

/**
 * Текстовая метка для поля ввода.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Label
 * @extends UI/Base:Control
 *
 * @mixes Controls/interface:IFontSize
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

    static _theme: string[] = ['Controls/input', 'Controls/Classes'];

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
