import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/BigGradient/Template';
import {Gadgets} from 'Controls-demo/tileNew/DataHelpers/DataCatalog';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import {HierarchicalMemory} from 'Types/source';
import { RecordSet } from 'Types/collection';
import { IItemAction } from 'Controls/itemActions';

const DATA = [
    {
        id: 1,
        parent: null,
        type: null,
        title: 'Папка с песцом и градиентом',
        gradientColor: '#8EC5FC',
        gradientStartColor: '#E0C3FC',
        gradientStopColor: '#8EC5FC',
        textColor: 'black',
        description: 'Элемент с описанием',
        imageProportion: '3:9',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': true,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }, {
        id: 2,
        parent: null,
        type: null,
        title: 'Сравнение условий конкурентов по ЭДО.xlsx',
        description: 'Элемент с описанием',
        gradientColor: '#FFFB7D',
        gradientStartColor: '#85FFBD',
        gradientStopColor: '#FFFB7D',
        textColor: 'black',
        imageProportion: '4:9',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }, {
        id: 3,
        parent: null,
        type: null,
        title: 'Сравнение условий конкурентов по ЭДО.xlsx',
        description: 'Элемент с описанием',
        gradientColor: '#FF3CAC',
        gradientStartColor: '#784BA0',
        gradientStopColor: '#FF3CAC',
        textColor: 'white',
        imageProportion: '1:9',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];
    protected _itemsReadyCallback: Function;
    protected _itemActions: IItemAction[];
    protected _items: RecordSet;
    
    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
        this._itemActions = Gadgets.getActions();
        this._itemsReadyCallback = (items: RecordSet) => {
            this._items = items;
        }
    }

    protected _hideImages() {
        this._items.each((item) => {
            item.set('image', null);
        });
    }

    protected _showImages() {
        this._items.each((item) => {
            item.set('image', explorerImages[8]);
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
