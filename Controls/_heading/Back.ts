import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import backTemplate = require('wml!Controls/_heading/Back/Back');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {detection} from 'Env/Env';
import {Logger} from 'UI/Utils';
import {backSize, backStyle} from './_ActualAPI';
import {IFontColorStyle, IFontColorStyleOptions, IFontSize, IFontSizeOptions, IIconSize, IIconSizeOptions, IFontWeight, IFontWeightOptions, IIconStyle, IIconStyleOptions} from 'Controls/interface';
type TBackStyle = 'primary' | 'secondary';

export interface IBackOptions extends IControlOptions, IFontColorStyleOptions, IFontSizeOptions, IIconStyleOptions, IIconSizeOptions, IFontWeight {
    style?: TBackStyle;
    size?: 's' | 'm' | 'l';
}

const MODERN_IE_VERSION = 11;

/**
 * Специализированный заголовок-кнопка для перехода на предыдущий уровень.
 *
 * Дополнительно о работе с заголовками читайте <a href="/doc/platform/developmentapl/interface-development/controls/content-managment/heading/">здесь</a>.
 *
 * См. <a href="/materials/Controls-demo/app/Controls-demo%2FHeaders%2FstandartDemoHeader">демо-пример</a>
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
 * @control
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
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Heading/Back/SizesAndStyles/Index
 */

/**
 * @name Controls/_heading/Back#style
 * @cfg {String} Стиль отображения заголовка-кнопки "Назад".
 * @variant primary
 * @variant secondary
 * @default primary
 * @example
 * Заголовок-кнопка со стилем по умолчанию.
 * <pre class="brush: html">
 *    <Controls.heading:Back />
 * </pre>
 * Заголовок-кнопка со стилем "secondary".
 * <pre class="brush: html">
 *    <Controls.heading:Back style="secondary" />
 * </pre>
 */

/*
 * @name Controls/_heading/Back#style
 * @cfg {String} Back heading display style.
 * @variant primary
 * @variant secondary
 * @default primary
 * @example
 * Back heading has default style.
 * <pre>
 *    <Controls.heading:Back/>
 * </pre>
 * Back heading has 'secondary' style.
 * <pre>
 *    <Controls.heading:Back style="secondary"/>
 * </pre>
 */

/**
 * @name Controls/_heading/Back#size
 * @cfg {String} Размер заголовка-кнопки "Назад".
 * @variant s Маленький заголовок.
 * @variant m Средний заголовок.
 * @variant l Большой заголовок.
 * @default m
 * @example
 * <pre class="brush: html">
 *    <Controls.heading:Back />
 * </pre>
 * <pre class="brush: html">
 *    <Controls.heading:Back size="l"/>
 * </pre>
 */

/*
 * @name Controls/_heading/Back#size
 * @cfg {String} Back heading size.
 * @variant s Small heading size.
 * @variant m Medium heading size.
 * @variant l Large heading size.
 * @default m
 * @example
 * Back heading has default size.
 * <pre>
 *    <Controls.heading:Back/>
 * </pre>
 * Back heading has 'l' size.
 * <pre>
 *    <Controls.heading:Back size="l"/>
 * </pre>
 */

class Back extends Control<IBackOptions> implements IFontColorStyle, IFontSize, IIconStyle, IIconSize, IFontWeight {
    protected _template: TemplateFunction = backTemplate;
    protected _isOldIe: Boolean = false;
    protected _style: TBackStyle;
    protected _fontSize: string;
    protected _fontColorStyle: string;
    protected _iconSize: string;
    protected _iconStyle: string;

    private _convertOldStyleToNew(options: IBackOptions): IBackOptions {
        if (options.style === 'default') {
            options.style = 'primary';
            Logger.warn('Heading.Back', 'Используются устаревшие стили. Используйте style primary вместо style default');
            return options;
        } else {
            return options;
        }
    }
    private _setFontState(options: IBackOptions): void {
        const convertOptions = this._convertOldStyleToNew(options);
        const styles = backStyle(convertOptions);
        this._iconStyle = styles.iconStyle;
        this._fontColorStyle = styles.fontColorStyle;
    }

    private _setSizeState(options: IBackOptions): void {
        const sizes = backSize(options);
        this._fontSize = sizes.fontSize;
        this._iconSize = sizes.iconSize;
    }

    protected _beforeMount(options: IBackOptions): void {
        this._setFontState(options);
        this._setSizeState(options);
        this._isOldIe = detection.isIE && detection.IEVersion < MODERN_IE_VERSION;
    }

    protected _beforeUpdate(newOptions: IBackOptions): void {
        if (newOptions.style !== this._options.style) {
            this._setFontState(newOptions);
            this._setSizeState(newOptions);
        }
    }

    static _theme: string[] = ['Controls/heading', 'Controls/Classes'];

    static getDefaultOptions(): object {
        return {
            style: 'primary',
            size: 'm'
        };
    }

    static getOptionTypes(): object {
        return {
            caption: EntityDescriptor(String).required(),
            style: EntityDescriptor(String).oneOf([
                'primary',
                'secondary',
                'default'
            ]),
            size: EntityDescriptor(String).oneOf([
                's',
                'm',
                'l'
            ]),
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
