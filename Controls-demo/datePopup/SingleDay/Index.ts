import {TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/datePopup/SingleDay/SingleDay';
import {default as Base} from 'Controls-demo/datePopup/Base/Index';

export default class extends Base {
    protected _template: TemplateFunction = template;
}
