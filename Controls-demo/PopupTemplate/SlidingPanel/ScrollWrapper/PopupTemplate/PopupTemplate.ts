import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/SlidingPanel/ScrollWrapper/PopupTemplate/PopupTemplate');

class PopupTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/Popup/SlidingPanel/PopupTemplate/PopupTemplate'
    ];
}
export default PopupTemplate;
