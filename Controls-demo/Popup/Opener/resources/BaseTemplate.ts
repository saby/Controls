import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Popup/Opener/resources/BaseTemplate');
class BaseTemplate extends Control<IControlOptions> {

    protected _template: TemplateFunction = template;
    protected _branch: String = '19.700/bugfix/create-dialog';
    protected _storage: String = 'controls';
    protected _heading: String = 'Регламент: Ошибка в документации.';
    protected _description: String = '(reg-chrome) 19.700 VDOM controls';

    static _styles: string[] = ['Controls-demo/Popup/Opener/resources/StackHeader'];
}
export default BaseTemplate;

