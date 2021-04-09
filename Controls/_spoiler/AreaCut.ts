import {TemplateFunction} from 'UI/Base';
import Cut from './Cut';
import * as template from 'wml!Controls/_spoiler/AreaCut/AreaCut';
import {ICutOptions} from './interface/ICut';
import {IAreaOptions} from 'Controls/input';

interface IAreaCutOptions extends IAreaOptions, ICutOptions{}

/**
 * Графический контрол, который ограничивает контент заданным числом строк в полях ввода.
 * Если контент превышает указанное число строк, то он обрезается и снизу добавляется многоточие.
 *
 * @class Controls/_spoiler/AreaCut
 * @extends UI/Base:Control
 * @mixes Controls/_spoiler/interface/ICut
 * @see Controls/_input/Area
 * @private
 *
 * @author Красильников А.С.
 */

class AreaCut extends Cut {
    protected _template: TemplateFunction = template;
    protected _expanded: boolean = true;
    protected _value: string;
    protected _firstEditPassed: boolean = false;

    protected _beforeMount(options: IAreaCutOptions): void {
        super._beforeMount(options);
        this._value = options.value;
        if (this._value) {
            this._firstEditPassed = true;
        }
    }

    protected _beforeUpdate(options: IAreaCutOptions): void {
        if (this._options.readOnly === false && options.readOnly === true) {
            this._expanded = false;
            if (options.readOnly && this._value) {
                this._firstEditPassed = true;
            }
        }
        super._beforeUpdate(options);
    }

    protected _valueChangedHandler(event: Event, value: string) {
        this._value = value;
        this._notify('valueChanged', [value]);
    }

    protected _mousedownHandler(): void {
        this._expanded = true;
    }

    static getDefaultOptions(): object {
        return {
            cutButtonVisibility: true,
            lineHeight: 'm',
            backgroundStyle: 'default',
            buttonVisible: true
        };
    }
}

export default AreaCut;
