import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/Standart/Template');
import {SyntheticEvent} from 'Vdom/Vdom';

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    protected toggleState: boolean = false;
    protected toggleState2: boolean = false;
    protected toggleState3: boolean = false;
    protected toggleState4: boolean = false;
    protected toggleState5: boolean = false;
    protected toggleState6: boolean = false;
    protected toggleState7: boolean = false;
    protected toggleState8: boolean = false;
    protected toggleState9: boolean = false;
    protected toggleState10: boolean = false;
    protected toggleState11: boolean = false;
    protected toggleState12: boolean = false;
    protected toggleState13: boolean = false;
    protected toggleState14: boolean = false;
    protected toggleState15: boolean = false;
    protected toggleState16: boolean = false;
    protected toggleState17: boolean = false;
    protected toggleState18: boolean = false;
    protected toggleState19: boolean = false;
    protected toggleState20: boolean = false;
    protected toggleState21: boolean = false;
    protected toggleState22: boolean = false;
    protected toggleState23: boolean = false;
    protected toggleState24: boolean = false;
    protected toggleState25: boolean = false;
    protected toggleState26: boolean = false;
    protected toggleState27: boolean = false;
    protected toggleState28: boolean = false;
    protected count: number = 0;

    protected clickHandler(): void {
        this.count++;
    }

    protected clickChangeState(e: SyntheticEvent<Event>, toggleButtonIndex: number, value: boolean): void {
        switch (toggleButtonIndex) {
            case 16:
                this.toggleState16 = value;
                break;
            case 17:
                this.toggleState17 = value;
                break;
            case 18:
                this.toggleState18 = value;
                break;
            case 19:
                this.toggleState19 = value;
                break;
            case 20:
                this.toggleState20 = value;
                break;
            case 21:
                this.toggleState21 = value;
                break;
        }
    }

    static _styles: string[] = ['Controls-demo/Buttons/Standart/Styles'];
}
export default Index;