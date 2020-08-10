import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IBackgroundStyle, IBackgroundStyleOptions} from 'Controls/interface';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_spoiler/Cut/Cut';

/**
 * @interface Controls/_spoiler/Cut/ICutOptions
 * @mixes Control/interface:IBackgroundStyle
 * @public
 * @author Красильников А.С.
 */
export interface ICutOptions extends IControlOptions, IBackgroundStyleOptions {
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
 * @mixes Controls/_spoiler/Cut/ICutOptions
 * @public
 * @demo Controls-demo/Spoiler/Cut/Index
 *
 * @author Красильников А.С.
 */
class Cut extends Control<ICutOptions> implements IBackgroundStyle {
    private _lines: number | null = null;

    protected _template: TemplateFunction = template;

    readonly '[Controls/_interface/IBackgroundStyle]': boolean = true;

    private _expand(): void {
        this._lines = null;
    }

    protected _beforeMount(options?: ICutOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._lines = options.lines;
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: ICutOptions, contexts?: any): void {
        if (this._options.lines !== options.lines) {
            this._lines = options.lines;
        }

        super._beforeUpdate(options, contexts);
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
