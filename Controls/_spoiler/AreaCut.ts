import {TemplateFunction} from 'UI/Base';
import Cut from './Cut';
import * as template from 'wml!Controls/_spoiler/AreaCut/AreaCut';
import {ICutOptions} from './interface/ICut';
import {IAreaOptions} from 'Controls/input';

interface IAreaCutOptions extends IAreaOptions, ICutOptions {}

/**
 * Графический контрол, который ограничивает контент заданным числом строк в полях ввода.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_spoiler/AreaCut
 * @extends UI/Base:Control
 * @implements Controls/spoiler:ICut
 * @see Controls/_input/Area
 * @public
 * @demo Controls-demo/Spoiler/AreaCut/Index
 *
 * @author Красильников А.С.
 */

class AreaCut extends Cut {
    protected _template: TemplateFunction = template;
    protected _expanded: boolean = true;
    protected _value: string | null;
    protected _firstEditPassed: boolean = false;

    protected _beforeUpdate(options: IAreaCutOptions): void {
        if (!options.readOnly && !this._firstEditPassed) {
            this._expanded = true;
        }
        if (!this._options.readOnly && options.readOnly) {
            this._expanded = false;
            if (options.readOnly && this._value) {
                this._firstEditPassed = true;
            }
        }
        super._beforeUpdate(options);
    }

    protected _valueChangedHandler(event: Event, value: string): void {
        this._value = value;
        this._notify('valueChanged', [value]);
    }

    protected _mousedownHandler(event: Event): void {
        if (!this._options.readOnly) {
            this._expanded = true;
        }
        event.preventDefault();
    }

    static getDefaultOptions(): object {
        return {
            lineHeight: 'm',
            backgroundStyle: 'default'
        };
    }
}

export default AreaCut;
