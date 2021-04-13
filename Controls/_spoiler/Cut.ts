import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IBackgroundStyle, IBackgroundStyleOptions, IExpandable, IExpandableOptions} from 'Controls/interface';
import {ICutButton} from './CutButton';
import Util from './Util';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/Cut/Cut';
import 'css!Controls/spoiler';

export interface ICutOptions extends IControlOptions, IBackgroundStyleOptions, IExpandableOptions, ICutButton {
    /**
     * @name Controls/_spoiler/ICut
     * @cfg {String} Высота строки.
     * @variant xs
     * @variant s
     * @variant m
     * @variant l
     * @variant xl
     * @variant 2xl
     * @variant 3xl
     * @variant 4xl
     * @variant 5xl
     * @default m
     * @demo Controls-demo/Spoiler/Cut/LineHeight/Index
     * @remark
     * Высота строки задается константой из стандартного набора размеров, который определен для текущей темы оформления.
     * @remark
     * Строковым значениям опции lineHeight соответствуют числовые (px), которые различны для каждой темы оформления.
     * @see lines
     */
    lineHeight: string;
    /**
     * @name Controls/_spoiler/ICut
     * @cfg {Number|null} Количество строк.
     * @remark
     * Указав значение null контент не будет иметь ограничение.
     * @demo Controls-demo/Spoiler/Cut/Lines/Index
     * @see lineHeight
     */
    lines: number | null;
    /**
     * @name Controls/_spoiler/ICut
     * @cfg {TemplateFunction|String} Контент контрола.
     * @demo Controls-demo/Spoiler/Cut/Content/Index
     */
    content: TemplateFunction | string;
    /**
     * @name Controls/_spoiler/ICut#buttonPosition
     * @cfg {String} Положение кнопки развертывания.
     * @variant start по левому краю контентной области
     * @variant center по центру контентной области
     * @default center
     * @demo Controls-demo/Spoiler/Cut/ButtonPosition/Index
     */
    /**
     * @name Controls/_spoiler/ICut#iconSize
     * @cfg
     * @demo Controls-demo/Spoiler/Cut/IconSize/Index
     */
    /**
     * @name Controls/_spoiler/ICut#contrastBackground
     * @cfg
     * @demo Controls-demo/Spoiler/Cut/ContrastBackground/Index
     */
}

/**
 * Графический контрол, который ограничивает контент заданным числом строк.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_spoiler/Cut
 * @extends UI/Base:Control
 * @implements Controls/spoiler:ICut
 * @public
 * @demo Controls-demo/Spoiler/Cut/Index
 *
 * @author Красильников А.С.
 */
class Cut extends Control<ICutOptions> implements IBackgroundStyle, IExpandable {
    private _lines: number | null = null;
    private _expanded: boolean = false;

    protected _template: TemplateFunction = template;

    readonly '[Controls/_interface/IBackgroundStyle]': boolean = true;
    readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;

    protected _beforeMount(options?: ICutOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._expanded = Util._getExpanded(options, this._expanded);
        this._lines = Cut._calcLines(options.lines, this._expanded);
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: ICutOptions, contexts?: any): void {
        if (options.hasOwnProperty('expanded') && this._options.expanded !== options.expanded) {
            this._expanded = options.expanded;
        }
        this._lines = Cut._calcLines(options.lines, this._expanded);

        super._beforeUpdate(options, contexts);
    }

    protected _onExpandedChangedHandler(event: Event, expanded: boolean): void {
        if (!this._options.hasOwnProperty('expanded')) {
            this._expanded = expanded;
        }
        this._notify('expandedChanged', [expanded]);
    }

    private static _calcLines(lines: number | null, expanded: boolean): number | null {
        return expanded ? null : lines;
    }

    static _theme: string[] = ['Controls/Classes'];

    static getOptionTypes(): object {
        return {
            lineHeight: descriptor(String),
            backgroundStyle: descriptor(String),
            lines: descriptor(Number, null).required()
        };
    }

    static getDefaultOptions(): object {
        return {
            lineHeight: 'm',
            backgroundStyle: 'default'
        };
    }
}

Object.defineProperty(Cut, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Cut.getDefaultOptions();
   }
});

export default Cut;


/**
 * Интерфейс для опций контрола, ограничивающего контент заданным числом строк.
 * @interface Controls/_spoiler/ICut
 * @implements Control/interface:IBackgroundStyle
 * @implements Control/interface:IExpandable
 * @implements Controls/interface:IIconSize
 * @implements Control/interface:IContrastBackground
 * @public
 * @author Красильников А.С.
 */