import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanelPopup/popupTemplate';

/**
 * Шаблон стекового окна для панели фильтра.
 * @class Controls/_filterPanelPopup/popupTemplate
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 *
 * @public
 */

/**
 * @name Controls/_filterPanelPopup/popupTemplate#bodyContentTemplate
 * @cfg {TemplateFunction} Шаблон окна панели фильтров.
 */

export default class PopupTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _handleCloseButtonClick(): void {
        this._notify('close', [], {bubbling: true});
    }
    static _theme: string[] = ['Controls/filterPanelPopup'];
}
