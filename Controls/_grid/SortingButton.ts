import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_grid/SortingResources/SortingButton');
import 'css!theme?Controls/grid';

/**
 * Контрол, используюемый для изменения сортировки внутри таблиц
 *
 * @class Controls/_grid/SortingButton
 * @extends Core/Control
 * @mixes Controls/_grid/SortingButton/Styles
 * @private
 * @see Controls/grid:SortingSelector
 */

/**
 * @name Controls/_grid/SortingButton#property
 * @cfg {String} Поле для сортировки.
 */

export interface ISortingButtonOptions extends IControlOptions {
    property: string;
}
class SortingButton extends Control<ISortingButtonOptions> {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        this._notify('sortingChanged', [this._options.property], {bubbling: true});
    }

    static _theme: [string] = ['Controls/grid'];
}

export default SortingButton;
