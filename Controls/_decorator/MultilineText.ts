import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_decorator/MultilineText/MultilineText';
import {descriptor} from 'Types/entity';

interface IMultilineTextDecoratorOptions extends IControlOptions {
    value: string;
}

const LINE_BREAK_SEPARATOR = '\n';

/**
 * Графический контрол, служащий для отображения в верстке многострочного текста.
 *
 * @remark
 * Служит для корректного отображения многострочного текста введенного через контрол Controls/input:Area
 *
 * @class Controls/_decorator/MultilineText
 * @extends UI/Base:Control
 * @public
 * @demo Controls-demo/Decorators/MultilineText/Index
 *
 * @author Красильников А.С.
 */
/**
 * @name Controls/_decorator/MultilineText#value
 * @cfg {string} Текст для отображения
 */
class MultilineText extends Control<IMultilineTextDecoratorOptions> {
    protected _textLines: string[] = [];

    protected _template: TemplateFunction = template;

    protected _beforeMount(options: IMultilineTextDecoratorOptions): void {
        this._textLines = this._getTextLinesList(options.value);
    }

    protected _beforeUpdate(options: IMultilineTextDecoratorOptions): void {
        if (options.value !== this._options.value) {
            this._textLines = this._getTextLinesList(options.value);
        }
    }

    private _getTextLinesList(text: string): string[] {
        return text.split(LINE_BREAK_SEPARATOR);
    }

    static getOptionTypes(): object {
        return {
            value: descriptor(String, null)
        };
    }

    static getDefaultOptions(): IMultilineTextDecoratorOptions {
        return {
            value: ''
        };
    }
}

export default MultilineText;
