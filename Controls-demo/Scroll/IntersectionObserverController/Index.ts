import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/IntersectionObserverController/IntersectionObserverController');

export default class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    private _logs: string = '';
    private _intersectHandler = (e, entries) =>{
        for (let i = 0; i < entries.length; i++) {
            this._logs += ' Обновился контент номер' + entries[i].data;
        }
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
