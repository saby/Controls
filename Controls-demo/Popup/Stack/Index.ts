import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Popup/Stack/Template');

class PopupStack extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _restrictiveContainer: string = '.popup-page-target-container';
    protected openStack(): void {
        this._children.stack.open({
            opener: this._children.button1,
            closeOnOutsideClick: true,
            restrictiveContainer: this._restrictiveContainer,
            template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
            width: 600,
        });
    }
    protected openMaximizedStack(): void {
        this._children.stack.open({
            opener: this._children.button2,
            restrictiveContainer: this._restrictiveContainer,
            minimizedWidth: 600,
            minWidth: 600,
            width: 600,
            maxWidth: 800,
            template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
            templateOptions: {
                maximized: true,
                maximizedButtonVisibility: true
            }
        });
    }
    protected openModalStack(): void {
        this._children.stack.open({
            opener: this._children.button4,
            restrictiveContainer: this._restrictiveContainer,
            modal: true,
            template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
            width: 600
        });
    }
    protected openStackCustomHeader(): void {
        this._children.stack.open({
            opener: this._children.button6,
            closeOnOutsideClick: true,
            restrictiveContainer: this._restrictiveContainer,
            template: 'Controls-demo/Popup/Opener/resources/StackTemplateHeader',
        });
    }
    protected openStackWithoutHead(): void {
        this._children.stack.open({
            opener: this._children.button7,
            width: 800,
            restrictiveContainer: this._restrictiveContainer,
            template: 'wml!Controls-demo/Popup/Opener/resources/StackTemplateWithoutHead',
        });
    }

    static _styles: string[] = ['Controls-demo/Popup/PopupPage', 'Controls-demo/Popup/Opener/resources/StackHeader'];
}
export default PopupStack;