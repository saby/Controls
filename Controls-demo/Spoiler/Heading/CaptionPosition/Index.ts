import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/Heading/CaptionPosition/CaptionPosition');
import 'css!Controls-demo/Controls-demo';

class CaptionPosition extends Control<IControlOptions> {
    private _expandedLeft: boolean = true;
    private _expandedRight: boolean = true;
    private _captions: string = 'Заголовок';

    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default CaptionPosition;
