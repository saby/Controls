import * as template from 'wml!Controls-demo/Tile/Grouping/Grouping';
import {TemplateFunction, Control} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImages';
import {groupConstants} from 'Controls/list';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _viewSource: HierarchicalMemory = null;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: [{
                id: 1,
                parent: null,
                type: null,
                title: 'Сравнение условий конкурентов по ЭДО.xlsx',
                image: explorerImages[4],
                isDocument: true,
                hiddenGroup: true,
                width: 200
            }, {
                id: 2,
                parent: null,
                type: null,
                title: 'Сравнение систем по учету рабочего времени.xlsx',
                image: explorerImages[5],
                isDocument: true,
                hiddenGroup: true,
                width: 200
            }, {
                id: 3,
                parent: null,
                type: null,
                title: 'Конфеты копия',
                image: explorerImages[3],
                width: 300
            }, {
                id: 4,
                parent: null,
                type: null,
                title: 'PandaDoc.docx',
                image: explorerImages[6],
                isDocument: true,
                width: 200
            }, {
                id: 5,
                parent: null,
                type: null,
                title: 'SignEasy.docx',
                image: explorerImages[7],
                isDocument: true,
                width: 200
            }, {
                id: 6,
                parent: null,
                type: null,
                title: 'Договор на поставку печатной продукции',
                image: explorerImages[0],
                isDocument: true,
                width: 200
            }, {
                id: 7,
                parent: null,
                type: null,
                title: 'Договор аренды помещения',
                image: explorerImages[1],
                isDocument: true,
                width: 200
            }, {
                id: 8,
                parent: null,
                type: null,
                title: 'Конфеты',
                image: explorerImages[3],
                width: 300
            }, {
                id: 9,
                parent: null,
                type: null,
                title: 'Скриншот от 25.12.16, 11-37-16',
                image: explorerImages[2],
                isDocument: true,
                width: 200
            }]
        });
    }

    private _groupingKeyCallback(item: Model): string {
        let group;
        if (item.get('hiddenGroup')) {
            group = groupConstants.hiddenGroup;
        } else {
            group = item.get('isDocument') ? 'document' : 'image';
        }
        return group;
    }
}
