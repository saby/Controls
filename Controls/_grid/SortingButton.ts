import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_grid/Render/SortingButton/SortingButton');
import 'css!Controls/grid';
export interface ISortingButtonOptions extends IControlOptions {
    property: string;
}
/**
 * Контрол, используемый для изменения сортировки внутри таблиц
 *
 * @class Controls/_grid/SortingButton
 * @extends UI/Base:Control
 * @mixes Controls/_grid/SortingButton/Styles
 *
 * @public
 *
 * @see Controls/grid:SortingSelector
 */
class SortingButton extends Control<ISortingButtonOptions> {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        this._notify('sortingChanged', [this._options.property], {bubbling: true});
    }
}
/**
 * @name Controls/_grid/SortingButton#property
 * @cfg {String} Поле для сортировки.
 */
export default SortingButton;
