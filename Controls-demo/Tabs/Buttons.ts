import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {Memory} from 'Types/source';
import template = require('wml!Controls-demo/Tabs/Buttons/Buttons');
import spaceTemplate = require('wml!Controls-demo/Tabs/Buttons/resources/spaceTemplate');
import itemTmpl = require('wml!Controls-demo/Tabs/Buttons/resources/itemTemplate');
import mainTemplate = require('wml!Controls-demo/Tabs/Buttons/resources/mainTemplate');
import photoContent = require('wml!Controls-demo/Tabs/Buttons/resources/photoContent');
import iconTemplate = require('wml!Controls-demo/Tabs/Buttons/resources/iconTemplate');

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;
    protected _spaceTemplate: TemplateFunction = spaceTemplate;
    protected SelectedKey1: string = '1';
    protected SelectedKeyLeft: string =  '2';
    protected SelectedKey2: string =  '1';
    protected SelectedKey3: string =  '4';
    protected SelectedKey4: string =  '2';
    protected SelectedKey5: string =  '2';
    protected SelectedKey6: string =  '1';
    protected SelectedKey7: string =  '3';
    protected SelectedKey8: string =  '2';
    protected SelectedKey9: string =  '2';
    protected SelectedKeyNull: string | null = null;
    protected _items: RecordSet | null = null;
    protected _items2: RecordSet | null = null;
    protected _items3: RecordSet | null = null;
    protected _items4: RecordSet | null = null;
    protected _items5: RecordSet | null = null;
    protected _sourceLeft: Memory | null = null;
    protected _source3: Memory | null = null;
    protected _source4: Memory | null = null;
    protected _source6: Memory | null = null;
    protected _source8: Memory | null = null;

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: 'Document'
                },
                {
                    id: '2',
                    title: 'Files'
                },
                {
                    id: '3',
                    title: 'Orders'
                }
            ]
        });

        this._sourceLeft = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Document',
                    align: 'left'
                },
                {
                    id: '2',
                    title: 'Files',
                    isMainTab: true,
                    align: 'left'
                },
                {
                    id: '3',
                    align: 'left',
                    title: 'Orders'
                }
            ]
        });
        this._items2 = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: 'Задача в разработку №1263182638123681268716831726837182368172631239999',
                    align: 'left',
                    itemTemplate: mainTemplate
                },
                {
                    id: '2',
                    title: 'Photos'
                },
                {
                    id: '3',
                    title: 'Videos'
                },
                {
                    id: '4',
                    title: 'Groups'
                },
                {
                    id: '5',
                    title: 'Documents'
                },
                {
                    id: '6',
                    title: 'Meetings'
                }
            ]
        });
        this._items3 = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: 'Meetings',
                    align: 'left',
                    itemTemplate: mainTemplate
                },
                {
                    id: '2',
                    align: 'left',
                    title: 'Photos'
                },
                {
                    id: '3',
                    align: 'left',
                    title: 'Videos'
                },
                {
                    id: '4',
                    title: 'Groups'
                }
            ]
        });
        this._source3 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    carambola: 'Person card',
                    align: 'left'
                },
                {
                    id: '2',
                    carambola: 'Photos'
                },
                {
                    id: '3',
                    carambola: 'Videos'
                },
                {
                    id: '4',
                    carambola: 'Groups'
                },
                {
                    id: '5',
                    carambola: 'Documents'
                },
                {
                    id: '6',
                    carambola: 'Meetings'
                }
            ]
        });
        this._source4 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Meetings',
                    align: 'left'
                },
                {
                    id: '2',
                    title: 'Groups'
                },
                {
                    id: '3',
                    title: 'Documents'
                }
            ]
        });
        this._items4 = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    align: 'left',
                    text: 'Отпуск',
                    icon: 'icon-Vacation',
                    iconStyle: 'success',
                    itemTemplate: itemTmpl,
                    leftTemplate: iconTemplate
                },
                {
                    id: '2',
                    align: 'left',
                    text: 'Отгул',
                    icon: 'icon-SelfVacation',
                    iconStyle: 'warning',
                    itemTemplate: itemTmpl,
                    leftTemplate: iconTemplate,
                    rightTemplate: iconTemplate
                },
                {
                    id: '3',
                    align: 'left',
                    text: 'Больничный',
                    icon: 'icon-Sick',
                    iconStyle: 'secondary',
                    itemTemplate: itemTmpl,
                    rightTemplate: iconTemplate
                }
            ]
        });
        this._source6 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title:
                        'Task number 12345678901234567890'
                },
                {
                    id: '2',
                    title: 'News',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Meetings'
                }
            ]
        });
        this._items5 = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: 'Person card',
                    align: 'left',
                    carambola: photoContent,
                    type: 'photo'
                },
                {
                    id: '2',
                    title: 'Documents',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Photos',
                    align: 'left'
                },
                {
                    id: '4',
                    title: 'Groups',
                    align: 'left'
                },
                {
                    id: '5',
                    title: 'Meetings'
                },
                {
                    id: '6',
                    title: 'Videos'
                },
                {
                    id: '7',
                    title: '',
                    carambola: photoContent,
                    type: 'photo'
                }
            ]
        });
        this._source8 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Document',
                    align: 'left',
                    contentTab: true

                },
                {
                    id: '2',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Orders',
                    align: 'left'
                }
            ]
        });
    }

    protected _setSource(): void {
        this._source6 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Videos'
                },
                {
                    id: '2',
                    title: 'Groups'
                },
                {
                    id: '3',
                    title: 'Photos'
                }
            ]
        });
        this._source6.destroy();
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons'];
}
