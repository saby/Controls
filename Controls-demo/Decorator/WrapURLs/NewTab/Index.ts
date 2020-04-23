import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/WrapURLs/NewTab/NewTab');

class NewTab extends Control<IControlOptions> {
    protected _value = 'Самая популярная поисковая система мира - это Google. Попробуйте сами https://www.google.com/.';

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static _theme: string[] = ['Controls/Classes'];
}

export default NewTab;
