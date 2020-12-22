import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import backTemplate = require('wml!Controls/_heading/Back/Back');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IIconSize,
    IIconSizeOptions,
    IIconStyle,
    IIconStyleOptions
} from 'Controls/interface';

export interface IBackOptions extends IControlOptions, IFontColorStyleOptions, IFontSizeOptions, IIconStyleOptions, IIconSizeOptions {
}

const MODERN_IE_VERSION = 11;

/**
 * Специализированный заголовок-кнопка для перехода на предыдущий уровень.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FHeaders%2FstandartDemoHeader демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/content-managment/heading/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_heading.less переменные тем оформления}
 *
 *
 * @class Controls/_heading/Back
 * @extends Core/Control
 * @implements Controls/_interface/ICaption
 * @implements Controls/_buttons/interface/IClick
 * @implements Controls/_interface/ITooltip
 * @implements Controls/_interface/IFontColorStyle
 * @implements Controls/_interface/IFontSize
 * @implements Controls/_interface/IIconSize
 * @implements Controls/_interface/IIconStyle
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

/*
 * Specialized heading to go to the previous level.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FHeaders%2FstandartDemoHeader">Demo-example</a>.
 *
 * @class Controls/_heading/Back
 * @extends Core/Control
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_buttons/interface/IClick
 * @mixes Controls/_interface/ITooltip
 * @implements Controls/_interface/IFontColorStyle
 * @implements Controls/_interface/IFontSize
 * @implements Controls/_interface/IIconSize
 * @implements Controls/_interface/IIconStyle
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

class Back extends Control<IBackOptions> implements IFontColorStyle, IFontSize, IIconStyle, IIconSize {
    protected _template: TemplateFunction = backTemplate;
    protected _isOldIe: Boolean = false;

    static _theme: string[] = ['Controls/heading', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            iconSize: 'm',
            fontSize: '3xl',
            iconStyle: 'secondary',
            fontColorStyle: 'primary'
        };
    }

    static getOptionTypes(): object {
        return {
            caption: EntityDescriptor(String).required(),
            fontColorStyle: EntityDescriptor(String).oneOf([
                'primary',
                'secondary'
            ]),
            iconStyle: EntityDescriptor(String).oneOf([
                'primary',
                'secondary'
            ]),
            iconSize: EntityDescriptor(String).oneOf([
                's',
                'm',
                'l'
            ])
        };
    }
}

export default Back;
