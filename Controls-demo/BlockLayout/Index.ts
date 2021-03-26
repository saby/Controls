import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/BlockLayout/Index');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/BlockLayout/Index';

class BlockLayouts extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes', 'Controls/BlockLayout'];
}

export default BlockLayouts;
