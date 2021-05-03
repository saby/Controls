import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Page/Page';
import {Controller} from 'Controls/popup';

/**
 * Контрол, который отвечает за построение шаблона страницы в окне
 * @class Controls/_popupTemplate/Page
 * @extends UI/Base:Control
 * @control
 * @private
 * @author Онищук Д.В.
 */
export default class Template extends Control<IControlOptions, void> {
    _template: TemplateFunction = template;
    protected _pageTemplate: string;
    protected _beforeMount(): void {
        this._pageTemplate = Controller.getPageTemplate();
    }
}
