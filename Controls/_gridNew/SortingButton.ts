import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_gridNew/Render/SortingButton/SortingButton');

export interface ISortingButtonOptions extends IControlOptions {
    property: string;
}
/**
 * Контрол, используемый для изменения сортировки внутри таблиц
 *
 * @class Controls/_gridNew/SortingButton
 * @extends UI/Base:Control
 * @mixes Controls/_gridNew/SortingButton/Styles
 *
 * @private
 *
 * @see Controls/gridNew:SortingSelector
 */
class SortingButton extends Control<ISortingButtonOptions> {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        this._notify('sortingChanged', [this._options.property], {bubbling: true});
    }

    static _theme: [string] = ['Controls/grid'];
}
/**
 * @name Controls/_gridNew/SortingButton#property
 * @cfg {String} Поле для сортировки.
 */
export default SortingButton;
