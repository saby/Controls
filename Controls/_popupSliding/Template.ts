import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupSliding/Template/Template';
import {ISlidingPanelTemplateOptions} from 'Controls/_popupSliding/interface/ISlidingPanelTemplate';
import { detection } from 'Env/Env';

/**
 *  Базовый шаблон окна-шторки.
 * @class Controls/_popupSliding/Template
 * @implements Controls/_popupSliding/interface/ISlidingPanelTemplate
 * @public
 * @demo Controls-demo/PopupTemplate/SlidingPanel/Index
 * @author Красильников А.С.
 */
export default class Template extends Control<ISlidingPanelTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _adaptiveTemplateName: Function = detection.isPhone ?
        'Controls/popupSliding:_SlidingPanel' :
        'Controls/popupTemplate:Stack';
}
