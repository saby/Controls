import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IBackgroundStyle, IBackgroundStyleOptions, IExpandable, IExpandableOptions} from 'Controls/interface';
import Util from './Util';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/Cut/Cut';

/**
 * Интерфейс для опций контрола, ограничивающего контент заданным числом строк.
 * @interface Controls/_spoiler/ICut
 * @mixes Control/interface:IBackgroundStyle
 * @mixes Control/interface:IExpandable
 * @public
 * @author Красильников А.С.
 */
export interface ICutOptions extends IControlOptions, IBackgroundStyleOptions, IExpandableOptions {
    /**
     * Высота строки.
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
     */
    lineHeight: string;
    /**
     * Количество строк.
     * @remark
     * Указав значение null контент не будет иметь ограничение.
     * @demo Controls-demo/Spoiler/Cut/Lines/Index
     */
    lines: number | null;
    /**
     * Контент контрола.
     * @demo Controls-demo/Spoiler/Cut/Content/Index
     */
    content: TemplateFunction | string;
}

/**
 * Графический контрол, который ограничивает контент заданным числом строк.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_spoiler/Cut
 * @extends UI/Base:Control
 * @implements Controls/_spoiler/ICut
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

    protected _clickOnEllipsisHandler(): void {
        const expanded = !this._expanded;
        if (!this._options.hasOwnProperty('expanded')) {
            this._expanded = expanded;
        }
        this._notify('expandedChanged', [expanded]);
    }

    private static _calcLines(lines: number | null, expanded: boolean): number | null {
        return expanded ? null : lines;
    }

    static _theme: string[] = ['Controls/Classes', 'Controls/spoiler'];

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

export default Cut;
