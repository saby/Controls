import {Control, IControlOptions, TemplateFunction } from 'UI/Base';
import {
    IFontColorStyle,
    IFontColorStyleOptions,
    IFontSize,
    IFontSizeOptions,
    IFontWeight,
    IFontWeightOptions
} from "Controls/interface";
import {date} from 'Types/formatter';

import * as template from 'wml!Controls/_decorator/Date/Date';
import 'css!Controls/decorator';

export interface IDateOptions extends IControlOptions, IFontColorStyleOptions, IFontWeightOptions, IFontSizeOptions {
    /**
     * @name Controls/_decorator/IDate#value
     * @cfg {Date} Декорируемая дата.
     * @demo Controls-demo/Decorator/Date/Index
     */
    value: Date;
    /**
     * @name Controls/_decorator/IDate#format
     * @cfg {string} Формат для преобразования даты.
     * @demo Controls-demo/Decorator/Date/Index
     */
    format: string;
    /**
     * @name Controls/_decorator/IDate#timeZoneOffset
     * @cfg {number} Опция, определяющая смещение часового пояса, в котором необходимо вывести значение.
     * @demo Controls-demo/Decorator/Date/Index
     */
    timeZoneOffset?: number;
}

/**
 * Графический контрол, декорирующий дату таким образом, что она приводится к заданному формату.
 *
 * @class Controls/_decorator/Date
 * @extends UI/Base:Control
 * @mixes Controls/decorator:IDate
 * @public
 * @demo Controls-demo/Decorator/Date/Index
 *
 * @author Сиряков М.К.
 */
class DateDecorator extends Control<IDateOptions> implements IFontColorStyle, IFontSize, IFontWeight {
    private _formattedDate: string;

    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;

    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IDateOptions): void {
        this._formattedDate = this._formatDate(options);
    }

    protected _beforeUpdate(newOptions: IDateOptions): void {
        if (
            this._options.value !== newOptions.value
            || this._options.format !== newOptions.format
            || this._options.timeZoneOffset !== newOptions.timeZoneOffset
        ) {
            this._formattedDate = this._formatDate(newOptions);
        }
    }

    private _calculateFontColorStyle(options: IDateOptions): string {
        return options.readOnly ? 'readonly' : options.fontColorStyle;
    }

    private _formatDate(options: IDateOptions): string {
        return date(options.value, options.format, options.timeZoneOffset);
    }
}

export default DateDecorator;

/**
 * Интерфейс для опций контрола {@link Controls/decorator:Date}.
 * @interface Controls/_decorator/IDate
 * @public
 * @author Сиряков М.К.
 */