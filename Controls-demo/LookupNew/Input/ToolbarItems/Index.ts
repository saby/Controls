import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/LookupNew/Input/ToolbarItems/Index';
import {COMPANIES} from 'Controls-demo/LookupNew/resources/DataStorage';
import {showType} from 'Controls/toolbars';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: Memory = new Memory({
        keyProperty: 'id',
        data: COMPANIES
    });
    protected _selectedKeys: string[] = ['Ромашка, ООО'];
    protected _value: string = 'Ромашка, ООО';
    protected _toolbarItems: RecordSet = new RecordSet({
        keyProperty: 'id',
        rawData: [
            {
                id: '1',
                viewMode: 'icon',
                icon: 'icon-Print',
                title: 'Распечатать',
                showType: showType.TOOLBAR
            }, {
                id: '2',
                viewMode: 'icon',
                icon: 'icon-Link',
                title: 'Скопировать в буфер',
                showType: showType.TOOLBAR
            }
        ]
    });

    protected _eventHandler(event, itemConfig): void {
        alert(`Click on: ${itemConfig.get('title')}`);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/LookupNew/Lookup'];
}
