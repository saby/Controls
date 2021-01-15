import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/View/popupTemplate';

/**
 * Шаблон стекового окна для панели фильтра.
 * @class Controls/_filterPanel/View/popupTemplate
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 *
 * @public
 */

/**
 * @name Controls/_filterPanel/View/popupTemplate#template
 * @cfg {TemplateFunction} Шаблон окна панели фильтров.
 */

export default class PopupTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _handleCloseButtonClick(): void {
        this._notify('close', [], {bubbling: true});
    }
}
