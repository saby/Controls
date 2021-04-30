import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Page/Page';

/**
 * Контрол, который отвечает за построение шаблона страницы
 * @class Controls/_popupTemplate/Page
 * @extends UI/Base:Control
 * @control
 * @private
 * @author Онищук Д.В.
 */
export default class Template extends Control<IControlOptions, void> {
    _template: TemplateFunction = template;

    // TODO: Тут должен быть базовый шаблон
    protected _pageTemplate: string = 'SabyPage/entityLayout:Template';
}
