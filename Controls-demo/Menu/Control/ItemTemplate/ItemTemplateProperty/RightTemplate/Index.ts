import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/ItemTemplate/ItemTemplateProperty/RightTemplate/Index');
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Menu/Menu';
import 'wml!Controls-demo/Menu/Control/ItemTemplate/ItemTemplateProperty/ItemTpl';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: [
                {key: '1', title: 'Save', icon: 'icon-Save'},
                {key: '2', title: 'Execute', icon: 'icon-Show'},
                {key: '3', title: 'Discuss', icon: 'icon-EmptyMessage', addIcon: 'icon-VideoCallNull', template: 'wml!Controls-demo/Menu/Control/ItemTemplate/ItemTemplateProperty/ItemTpl'},
                {key: '4', title: 'For control', icon: 'icon-Sent2'}
            ],
            keyProperty: 'key'
        });
    }
}
