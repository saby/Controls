import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/WrapURLs/NewTab/NewTab');
import 'css!Controls-demo/Controls-demo';

class NewTab extends Control<IControlOptions> {
    protected _value = 'Самая популярная поисковая система мира - это Google. Попробуйте сами https://www.google.com/.';

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}

export default NewTab;
