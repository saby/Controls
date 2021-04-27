import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import backTemplate = require('wml!Controls/_heading/Back/Back');
import {descriptor as EntityDescriptor} from 'Types/entity';
import 'css!Controls/heading';

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
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_heading.less переменные тем оформления}
 *
 *
 * @class Controls/_heading/Back
 * @extends UI/Base:Control
 * @implements Controls/interface:ICaption
 * @implements Controls/buttons:IClick
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:IIconStyle
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

 /**
 * @name Controls/_heading/Back#fontColorStyle
 * @cfg
 * @variant primary
 * @variant secondary
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.heading:Back caption="Back" fontColorStyle="primary"/>
 * <Controls.heading:Back caption="Back" fontColorStyle="secondary"/>
 * </pre>
 * @demo Controls-demo/Heading/Back/FontColorStyle
 */

/*
 * Specialized heading to go to the previous level.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FHeaders%2FstandartDemoHeader">Demo-example</a>.
 *
 * @class Controls/_heading/Back
 * @extends UI/Base:Control
 * @mixes Controls/interface:ICaption
 * @mixes Controls/buttons:IClick
 * @mixes Controls/interface:ITooltip
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:IIconStyle
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

class Back extends Control<IBackOptions> implements IFontColorStyle, IFontSize, IIconStyle, IIconSize {
    protected _template: TemplateFunction = backTemplate;
    protected _isOldIe: Boolean = false;

    static _theme: string[] = ['Controls/Classes'];

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

Object.defineProperty(Back, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Back.getDefaultOptions();
   }
});

export default Back;
