import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_decorator/TextOverflow/TextOverflow';

/**
 * @interface Controls/_decorator/TextOverflow/ITextOverflowOptions
 * @public
 * @author Красильников А.С.
 */
export interface ITextOverflowOptions extends IControlOptions {
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
     * @demo Controls-demo/Decorator/TextOverflow/LineHeight/Index
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
     * @demo Controls-demo/Decorator/TextOverflow/Lines/Index
     */
    lines: number | null;
    /**
     * @demo Controls-demo/Decorator/TextOverflow/Content/Index
     */
    content: TemplateFunction | string;
}

/**
 * Графический контрол, который ограничивает контент заданным числом строк.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_decorator/TextOverflow
 * @extends UI/Base:Control
 * @mixes Controls/_decorator/TextOverflow/ITextOverflowOptions
 * @public
 * @demo Controls-demo/Decorator/TextOverflow/Index
 *
 * @author Красильников А.С.
 */
class TextOverflow extends Control<ITextOverflowOptions> {
    private _lines: number | null = null;

    protected _template: TemplateFunction = template;

    private _expand(): void {
        this._lines = null;
    }

    protected _beforeMount(options?: ITextOverflowOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._lines = options.lines;
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: ITextOverflowOptions, contexts?: any): void {
        if (this._options.lines !== options.lines) {
            this._lines = options.lines;
        }

        super._beforeUpdate(options, contexts);
    }

    static _theme: string[] = ['Controls/Classes', 'Controls/decorator'];

    static getOptionTypes(): object {
        return {
            lineHeight: descriptor(String),
            lines: descriptor(Number, null).required()
        };
    }

    static getDefaultOptions(): object {
        return {
            lineHeight: 'm'
        };
    }
}

export default TextOverflow;
