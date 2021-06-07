import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {_companies} from 'Controls-demo/Lookup/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/JumpingLabel/JumpingLabel');

import 'Controls/input';

class JumpingLabel extends Control<IControlOptions> {
    private _name: string = 'Maxim';
    private _source: Memory = new Memory({
        data: _companies,
        idProperty: 'id',
        filter: (item) => Boolean(item)
    });
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default JumpingLabel;
