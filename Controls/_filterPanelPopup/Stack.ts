import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanelPopup/Stack';

/**
 * Шаблон стекового окна для панели фильтра.
 * @class Controls/_filterPanelPopup/Stack
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 *
 * @public
 */

/**
 * @name Controls/_filterPanelPopup/Stack#bodyContentTemplate
 * @cfg {TemplateFunction} Шаблон окна панели фильтров.
 */

export default class Stack extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static _theme: string[] = ['Controls/filterPanelPopup'];
}
