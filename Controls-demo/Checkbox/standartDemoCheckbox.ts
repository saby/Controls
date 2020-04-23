import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import controlTemplate = require('wml!Controls-demo/Checkbox/standartDemoCheckbox');
import content1 = require('wml!Controls-demo/Checkbox/resources/content1');
import content2 = require('wml!Controls-demo/Checkbox/resources/content2');
import content3 = require('wml!Controls-demo/Checkbox/resources/content3');

class StandartDemoCheckbox extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _content1: TemplateFunction =  content1;
    protected _content2: TemplateFunction = content2;
    protected _content3: TemplateFunction = content3;
    protected _value = false;
    protected _value2 =  false;
    protected _value3 = false;
    protected _value4 = false;
    protected _value5 = false;
    checkEvent(e: SyntheticEvent<Event>, checkboxIndex, value): void {
        switch (checkboxIndex) {
            case 1:
                this._value = value;
                break;
            case 2:
                this._value2 = value;
                break;
            case 3:
                this._value3 = value;
                break;
            case 4:
                this._value4 = value;
                break;
            case 5:
                this._value5 = value;
                break;
        }
    }
    static _theme: string[] = ['Controls/Classes'];
}
export default StandartDemoCheckbox;
