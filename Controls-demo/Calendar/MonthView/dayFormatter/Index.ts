import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Calendar/MonthView/dayFormatter/dayFormatter');

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _dayFormatter = (date): object => {
        if (date.getDate() === 22) {
            return {
                today: true
            };
        }
        if (date.getDate() === 21) {
            return {
                clickable: false
            };
        }
        if (date.getDate() === 20) {
            return {
                selectionEnabled: false
            };
        }
        if (date.getDate() === 19) {
            return {
                weekend: true
            };
        }
        return {};
    }

    private _month: Date = new Date(2019, 2);

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Index;
