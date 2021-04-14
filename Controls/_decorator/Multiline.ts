import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_decorator/Multiline/Multiline';
import {descriptor} from 'Types/entity';

interface IMultilineTextDecoratorOptions extends IControlOptions {
    value: string;
}

const LINE_BREAK_SEPARATOR = '\n';

/**
 * Графический контрол, служащий для отображения в верстке многострочного текста.
 *
 * @remark
 * Служит для отображения многострочного текста введенного через контрол Controls/input:Area
 *
 * @class Controls/_decorator/Multiline
 * @extends UI/Base:Control
 * @public
 * @demo Controls-demo/Decorator/Phone/Index
 *
 * @author Красильников А.С.
 */
class Multiline extends Control<IMultilineTextDecoratorOptions> {
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

export default Multiline;
