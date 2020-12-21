import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { TColumns } from 'Controls/grid';
import * as Template from 'wml!Controls-demo/grid/Colspan/Colspan';
import * as FirstColumnTemplate from 'wml!Controls-demo/grid/Colspan/FirstColumn';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _rawData: any[] = [
        {
            key: 1,
            name: 'Вяткина Алевтина',
            data: {},
            total: 10,
            new: 2,
            communicated: 3,
            likes: 1,
            dislikes: 4,
            sales: 7990,
            type: true,
            parent: null
        },
        {
            key: 2,
            name: 'Бондаренко Юлия',
            data: {},
            total: 10,
            new: 10,
            communicated: 0,
            likes: 0,
            dislikes: 0,
            sales: 0,
            type: true,
            parent: null
        },
        {
            key: 3,
            name: 'Мартюшева Ксения',
            data: {},
            total: 10,
            new: 1,
            communicated: 7,
            likes: 2,
            dislikes: 0,
            sales: 12170,
            type: true,
            parent: null
        },
        {
            key: 4,
            name: 'Мохова Светлана',
            data: {},
            total: 10,
            new: 10,
            communicated: 0,
            likes: 0,
            dislikes: 0,
            sales: 0,
            type: true,
            parent: null
        },
        {
            key: 10,
            name: 'Абак, ООО',
            data: {
                city: 'Москва',
                message: '07 авг. Обращение / Ничего не работает!'
            },
            type: null,
            parent: 1
        },
        {
            key: 11,
            name: 'АГРОПЛАН, ООО',
            data: {
                city: 'Москва',
                message: '30.09.17 ЭО продление / Неверные контактные данные'
            },
            type: null,
            parent: 1
        },
        {
            key: 12,
            name: 'Баранов Вадим',
            data: {
                city: 'Санкт-Петербург',
                message: '30.09.17 ЭО новые клиенты / Все установили'
            },
            type: null,
            parent: 1
        },
    ];

    protected _columns: TColumns = [
        {
            template: FirstColumnTemplate,
            width: '200px'
        },
        {
            displayProperty: 'total',
            width: '50px'
        },
        {
            displayProperty: 'new',
            width: '50px'
        },
        {
            displayProperty: 'communicated',
            width: '50px'
        },
        {
            displayProperty: 'likes',
            width: '50px'
        },
        {
            displayProperty: 'dislikes',
            width: '50px'
        },
        {
            displayProperty: 'sales',
            width: '50px'
        }
    ];

    protected _colspanCalculationCallback(item, column, columnIndex) {
        if (item.get('type') === true) {
            return {};
        }
        return {
            colspan: 7
        }
        /*
            0 > colspan = 7
            colIndex = 0 + (7-1) = 6
            {
                start: 1,
                stop: 8
            }
        */
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._rawData
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
