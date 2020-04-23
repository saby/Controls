import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/TagEvents/TagEvents');

class TagEvents extends Control<IControlOptions> {
    protected _placeholder = 'Tooltip';

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    protected _showInfoBox(event, tag): void {
        const config = {
            target: tag,
            message: 'Hello world!!!'
        };

        this._notify('openInfoBox', [config], {bubbling: true})
    }

    static _theme: string[] = ['Controls/Classes'];
}
export default TagEvents;
