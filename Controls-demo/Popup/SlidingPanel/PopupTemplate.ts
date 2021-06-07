import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/SlidingPanel/PopupTemplate/PopupTemplate');

class PopupTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _controlButtonVisibility: boolean = true;
    protected _isLargeContent: boolean = false;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/Popup/SlidingPanel/PopupTemplate/PopupTemplate'
    ];
}
export default PopupTemplate;
