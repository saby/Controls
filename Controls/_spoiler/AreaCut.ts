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
    protected _cutButtonVisibility: boolean = true;
    private _shouldUpdateCutButtonVisibility: boolean = true;

    protected _beforeMount(options: IAreaCutOptions): void {
        if (options.value) {
            this._firstEditPassed = true;
            this._value = options.value;
        }
        super._beforeMount(options);
    }

    protected _beforeUpdate(options: IAreaCutOptions): void {
        if (!options.readOnly && !this._firstEditPassed) {
            this._expanded = true;
        }
        if (!this._options.readOnly && options.readOnly) {
            this._expanded = false;
            this._cutButtonVisibility = true;
            this._shouldUpdateCutButtonVisibility = true;
            if (options.readOnly && this._value) {
                this._firstEditPassed = true;
            }
        }
        if (options.hasOwnProperty('expanded') && this._expanded !== options.expanded && !options.expanded) {
            this._shouldUpdateCutButtonVisibility = true;
            this._cutButtonVisibility = true;
        }
        super._beforeUpdate(options);
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
        // По нажатию на область поля ввода в режиме редактирования при свернутом кате мы должны развернуть кат, а
        // только потом пользователь сможет поставить курсор в поле ввода. Для этого кнопка ката растягивается на всю
        // область как элемент, при клике на нее мы раскроем кат. Если контента будет не достаточно для ката, кнопка
        // все равно будет занимать эту область. Пользователь не будет видеть состояние кнопки и будет казаться, что он
        // делает лишний клик просто так. Посчитаем, достаточно ли контента для показа ката во время того, как навели
        // мышкой на контрол, если нет - скроем кнопку.
        if (this._shouldUpdateCutButtonVisibility) {
            this._shouldUpdateCutButtonVisibility = false;
            this._countCutButtonVisibility();
        }
    }

    private _countCutButtonVisibility(): void {
        const containerHeight = this._container.clientHeight;
        const contentHeight = this._children.content.clientHeight;
        this._cutButtonVisibility = contentHeight > containerHeight;
    }

    protected _onExpandedChangedHandler(event: Event, expanded: boolean): void {
        if (this._expanded !== expanded) {
            this._expanded = expanded;
            if (!this._expanded) {
                this._shouldUpdateCutButtonVisibility = true;
            }
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
