import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import controlTemplate = require('wml!Controls-demo/Scroll/IntersectionObserver/Default/Template');
import 'css!Controls-demo/Controls-demo';

export default class IntersectionObserverDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _logs: string[] = [];

    protected _intersectHandler(e: SyntheticEvent, entryData) {
        this._logs.push(`Обновилась видимость блока ${entryData.data}. Видно ${entryData.nativeEntry.intersectionRatio*100}%`);
    }
    static _theme: string[] = ['Controls/Classes'];
}
