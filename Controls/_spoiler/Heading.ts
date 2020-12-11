import {Logger} from 'UI/Utils';
import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    ITooltip,
    ITooltipOptions,
    IExpandable,
    IExpandableOptions,
    IFontSize,
    IFontSizeOptions,
    IFontWeight,
    IFontWeightOptions,
    TFontWeight,
    IFontColorStyle,
    IFontColorStyleOptions
} from 'Controls/interface';
import Util from './Util';
import {getTextWidth} from 'Controls/sizeUtils';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/Heading/Heading';

type TCaptions = string | string[];
type TView = 'expanded' | 'collapsed';
type TIcon = 'ExpandLight' | 'CollapseLight';

/**
 * Интерфейс опций контрола {@link Controls/spoiler:Heading}.
 * @interface Controls/_spoiler/IHeading
 * @public
 * @author Красильников А.С.
 */
export interface IHeadingOptions extends IControlOptions, IExpandableOptions, IFontSizeOptions, ITooltipOptions,
    IFontWeightOptions, IFontColorStyleOptions {
    /**
     * Заголовок.
     * @type string | string[]
     * @remark
     * Изменяемый заголовок в зависимости от {@link Controls/_spoiler/Heading#expanded состояния развернутости}
     * настраивается через массив с парой заголовков.
     * Первый элемент соответствует expanded = true.
     * Второй элемент соответствует expanded = false.
     * Для изменения пары заголовков нужно передать новый массив.
     *
     * Полезные ссылки:
     * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_spoiler.less">переменные тем оформления</a>
     *
     * @demo Controls-demo/Spoiler/Heading/Captions/Index
     */
    captions: TCaptions;
    /**
     * Позиция заголовка относительно контейнера.
     * @default right
     * @demo Controls-demo/Spoiler/Heading/CaptionPosition/Index
     */
    captionPosition: 'left' | 'right';
}

export interface IHeading extends IExpandable, IFontSize, ITooltip, IFontWeight, IFontColorStyle {
    readonly '[Controls/_spoiler/IHeading]': boolean;
}

/**
 * Графический контрол, отображаемый в виде загловка с состоянием развернутости.
 * Предоставляет пользователю возможность запуска события смены состояния развернутости при нажатии на него.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_spoiler.less">переменные тем оформления</a>
 * * <a href="http://axure.tensor.ru/StandardsV8/%D1%81%D0%BF%D0%BE%D0%B9%D0%BB%D0%B5%D1%80%D1%8B_%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0_%D1%81%D0%BF%D0%BE%D0%B9%D0%BB%D0%B5%D1%80%D0%BE%D0%B2.html">стандарт</a>
 *
 * @class Controls/_spoiler/Heading
 * @extends UI/Base:Control
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IExpandable
 * @implements Controls/spoiler:IHeading
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Spoiler/Heading/Index
 */
class Heading extends Control<IHeadingOptions> implements IHeading {
    protected _icon: TIcon;
    protected _view: TView;
    protected _caption: string;
    protected _expanded: boolean;
    protected _fontWeight: TFontWeight;
    protected _fontColorStyle: string;

    protected _template: TemplateFunction = template;

    readonly '[Controls/_spoiler/IHeading]': boolean = true;
    readonly '[Controls/_interface/ITooltip]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;
    private _tooltip: string;

    private _updateState(options: IHeadingOptions): void {
        this._view = Heading._calcView(this._expanded);
        this._caption = Heading._calcCaption(options.captions, this._expanded);
        this._fontWeight = Heading._calcFontWeight(this._expanded, options.fontWeight);
        this._fontColorStyle = Heading._calcFontColorStyle(this._expanded, options.fontColorStyle);
    }

    protected _beforeMount(options?: IHeadingOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._expanded = Util._getExpanded(options, false);
        this._updateState(options);

        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: IHeadingOptions, contexts?: any): void {
        if (options.hasOwnProperty('expanded') && this._options.expanded !== options.expanded) {
            this._expanded = options.expanded;
        }
        this._updateState(options);

        super._beforeUpdate(options, contexts);
    }

    protected _clickHandler(): void {
        const expanded = !this._expanded;
        if (!this._options.hasOwnProperty('expanded')) {
            this._expanded = expanded;
        }
        this._tooltip = '';
        this._notify('expandedChanged', [expanded]);
    }

    protected _mouseenterHandler(event: Event, caption: string = ''): string {
        if (this._options.tooltip) {
            this._tooltip = this._options.tooltip;
        } else if (!this._tooltip) {
            const captionWidth = this._getTextWidth(caption);
            if (captionWidth > this._children.captionContainer.clientWidth) {
                this._tooltip = caption;
            }
        }
        return this._tooltip;
    }

    private _getTextWidth(caption: string): number {
        return getTextWidth(caption);
    }

    static _theme: string[] = ['Controls/spoiler', 'Controls/Classes'];

    private static _captionToString(caption?: string): string {
        if (typeof caption === 'string') {
            return caption;
        }

        return '';
    }

    private static _calcCaption(captions: TCaptions, expanded: boolean): string {
        if (captions instanceof Array) {
            const requiredCountCaptions: number = 2;

            if (captions.length !== requiredCountCaptions) {
                Logger.error('Неверное количество заголовков.');
            }
            const caption: string | undefined = expanded ? captions[0] : captions[1];
            return Heading._captionToString(caption);
        } else {
            return captions;
        }
    }

    private static _calcView(expanded: boolean): TView {
        return expanded ? 'expanded' : 'collapsed';
    }

    protected static _calcFontWeight(expanded: boolean, fontWeight?: TFontWeight): TFontWeight {
        if (fontWeight) {
            return fontWeight;
        }

        return expanded ? 'bold' : 'default';
    }

    protected static _calcFontColorStyle(expanded: boolean, fontColorStyle?: string): string {
        if (fontColorStyle) {
            return fontColorStyle;
        }

        return expanded ? 'secondary' : 'label';
    }

    static getDefaultOptions(): Partial<IHeadingOptions> {
        return {
            captions: '',
            fontSize: 'm',
            captionPosition: 'right'
        };
    }

    static getOptionTypes(): Partial<IHeadingOptions> {
        return {
            fontSize: descriptor(String),
            fontWeight: descriptor(String),
            fontColorStyle: descriptor(String),
            expanded: descriptor(Boolean),
            captions: descriptor(String, Array),
            captionPosition: descriptor(String).oneOf(['left', 'right'])
        };
    }
}

export default Heading;

/**
 * @name Controls/_spoiler/Heading#fontWeight
 * @cfg {Enum} Начертание шрифта.
 * @variant bold
 * @variant default
 *
 * @remark
 * Когда опция не задана, то её значение определяется контролом в зависимости от состояния развернутости.
 * В развернутом состоянии это bold, а в свётнутом это default.
 *
 * @demo Controls-demo/Spoiler/Heading/FontWeight/Index
 * @see expanded
 */
/**
 * @name Controls/_spoiler/Heading#fontColorStyle
 * @cfg {Enum} Стиль цвета текста и иконки контрола.
 * @variant label
 * @variant secondary
 *
 * @remark
 * Когда опция не задана, то её значение определяется контролом в зависимости от состояния развернутости.
 * В развернутом состоянии это secondary, а в свётнутом это label.
 *
 * @demo Controls-demo/Spoiler/Heading/FontColorStyle/Index
 * @see expanded
 */
