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
    protected _wasMouseEnter: boolean = false;
    protected _cutButtonVisibility: boolean = true;
    private _shouldUpdateCutButtonVisibility: boolean = false;

    private _contentElement: HTMLElement;

    protected _beforeMount(options: IAreaCutOptions): void {
        if (options.value) {
            this._firstEditPassed = true;
            this._value = options.value;
        }
        super._beforeMount(options);
    }

    protected _afterMount(): void {
        this._contentElement = this._container.querySelector('.controls-AreaCut__content');
    }

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

    protected _afterUpdate(): void {
        // Высчитываем значения отложенно, т.к. верстка еще не поменялась
        if (this._shouldUpdateCutButtonVisibility) {
            this._countCutButtonVisibility();
        }
    }

    protected _valueChangedHandler(event: Event, value: string): void {
        this._value = value;
        this._expanded = true;
        this._countCutButtonVisibility();
        this._notify('valueChanged', [value]);
    }

    protected _mousedownHandler(event: Event): void {
        if (!this._options.readOnly && !this._expanded) {
            this._expanded = true;
            this._notify('expandedChanged', [this._expanded]);
            event.preventDefault();
        }
    }

    protected _mouseEnterHandler(): void {
        if (!this._wasMouseEnter) {
            this._wasMouseEnter = true;
            this._countCutButtonVisibility();
        }
    }

    private _countCutButtonVisibility(): void {
        const containerHeight = this._container.clientHeight;
        const contentHeight = this._contentElement.clientHeight;
        this._cutButtonVisibility = contentHeight > containerHeight;
    }

    protected _onExpandedChangedHandler(event: Event, expanded: boolean): void {
        if (this._expanded !== expanded) {
            this._shouldUpdateCutButtonVisibility = true;
            this._expanded = expanded;
            this._notify('expandedChanged', [this._expanded]);
        }
    }

    static getDefaultOptions(): object {
        return {
            lineHeight: 'm',
            backgroundStyle: 'default'
        };
    }
}

export default AreaCut;
