import Control = require('Core/Control');
import template = require('wml!Controls-demo/Explorer/CheckboxOnHover/CheckboxOnHover');
import {view as constView} from 'Controls/Constants';
import ExplorerImages = require('Controls-demo/Explorer/ExplorerImages');
import {HierarchicalMemory} from 'Types/source';
import {showType} from 'Controls/Utils/Toolbar';

class Demo extends Control {

    protected _template = template;
    static _styles: string[] = ['Controls-demo/Explorer/Demo/Demo'];
    _viewSource: HierarchicalMemory;
    _viewSourceDynamic: HierarchicalMemory;
    _selectedKeys: Array<number> = [];
    _selectedKeys1: Array<number> = [];
    _selectedKeys2: Array<number> = [];
    _selectedKeys3: Array<number> = [];
    _selectedKeys4: Array<number> = [];
    _excludedKeys: Array<number> = [];
    _itemActions: Array<{
        id: number;
        icon: string;
        title: string;
        showType: number;
    }>;

    _beforeMount() {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: [
                {
                    id: 1,
                    'parent': null,
                    'type': true,
                    title: 'Документы отделов'
                },
                {
                    id: 11,
                    'parent': 1,
                    'type': true,
                    title: '1. Электронный документооборот'
                },
                {
                    id: 12,
                    'parent': 1,
                    'type': true,
                    title: '2. Отчетность через интернет'
                },
                {
                    id: 13,
                    'parent': 1,
                    'type': null,
                    title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                    image: ExplorerImages[4],
                    isDocument: true
                },
                {
                    id: 111,
                    'parent': 11,
                    'type': true,
                    title: 'Задачи'
                },
                {
                    id: 112,
                    'parent': 11,
                    'type': null,
                    title: 'Сравнение систем по учету рабочего времени.xlsx',
                    image: ExplorerImages[5],
                    isDocument: true
                },
                {
                    id: 2,
                    'parent': null,
                    'type': true,
                    title: 'Техническое задание'
                },
                {
                    id: 21,
                    'parent': 2,
                    'type': null,
                    title: 'PandaDoc.docx',
                    image: ExplorerImages[6],
                    isDocument: true
                },
                {
                    id: 22,
                    'parent': 2,
                    'type': null,
                    title: 'SignEasy.docx',
                    image: ExplorerImages[7],
                    isDocument: true
                },
                {
                    id: 3,
                    'parent': null,
                    'type': true,
                    title: 'Анализ конкурентов'
                },
                {
                    id: 4,
                    'parent': null,
                    'type': null,
                    title: 'Договор на поставку печатной продукции',
                    image: ExplorerImages[0],
                    isDocument: true
                },
                {
                    id: 5,
                    'parent': null,
                    'type': null,
                    title: 'Договор аренды помещения',
                    image: ExplorerImages[1],
                    isDocument: true
                },
                {
                    id: 6,
                    'parent': null,
                    'type': null,
                    title: 'Конфеты',
                    image: ExplorerImages[3]

                },
                {
                    id: 7,
                    'parent': null,
                    'type': null,
                    title: 'Скриншот от 25.12.16, 11-37-16',
                    image: ExplorerImages[2],
                    isDocument: true
                }
            ]
        });
        this._viewSourceDynamic = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: [
                {
                    id: 1,
                    'parent': null,
                    'type': null,
                    title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                    image: ExplorerImages[4],
                    isDocument: true,
                    hiddenGroup: true,
                    width: 200
                },
                {
                    id: 2,
                    'parent': null,
                    'type': null,
                    title: 'Сравнение систем по учету рабочего времени.xlsx',
                    image: ExplorerImages[5],
                    isDocument: true,
                    hiddenGroup: true,
                    width: 200
                },
                {
                    id: 3,
                    'parent': null,
                    'type': null,
                    title: 'Конфеты копия',
                    image: ExplorerImages[3],
                    width: 300
                },
                {
                    id: 4,
                    'parent': null,
                    'type': null,
                    title: 'PandaDoc.docx',
                    image: ExplorerImages[6],
                    isDocument: true,
                    width: 200
                },
                {
                    id: 5,
                    'parent': null,
                    'type': null,
                    title: 'SignEasy.docx',
                    image: ExplorerImages[7],
                    isDocument: true,
                    width: 200
                },
                {
                    id: 6,
                    'parent': null,
                    'type': null,
                    title: 'Договор на поставку печатной продукции',
                    image: ExplorerImages[0],
                    isDocument: true,
                    width: 200
                },
                {
                    id: 7,
                    'parent': null,
                    'type': null,
                    title: 'Договор аренды помещения',
                    image: ExplorerImages[1],
                    isDocument: true,
                    width: 200
                },
                {
                    id: 8,
                    'parent': null,
                    'type': null,
                    title: 'Конфеты',
                    image: ExplorerImages[3],
                    width: 300
                },
                {
                    id: 9,
                    'parent': null,
                    'type': null,
                    title: 'Скриншот от 25.12.16, 11-37-16',
                    image: ExplorerImages[2],
                    isDocument: true,
                    width: 200
                }
            ]
        });
        this._itemActions = [
            {
                id: 1,
                icon: 'icon-PhoneNull',
                title: 'phone',
                showType: showType.MENU
            },
            {
                id: 2,
                icon: 'icon-EmptyMessage',
                title: 'message',
                showType: showType.MENU
            }
        ];
    }

    _groupingKeyCallback(item) {
        let group;
        if (item.get('hiddenGroup')) {
            group = constView.hiddenGroup;
        } else {
            group = item.get('isDocument') ? 'document' : 'image';
        }
        return group;
    }

}

export = Demo;
