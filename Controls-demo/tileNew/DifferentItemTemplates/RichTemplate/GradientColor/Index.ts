import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/GradientColor/Template';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import {HierarchicalMemory} from 'Types/source';
import { RecordSet } from 'Types/collection';

const DATA = [
    {
        id: 1,
        parent: null,
        type: null,
        title: '#F00',
        gradientColor: '#F00',
        description: '1) Должен быть красный градиент',
        imageProportion: '1:1',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }, {
        id: 2,
        parent: null,
        type: null,
        title: '#f00',
        description: '2) Должен быть красный градиент',
        gradientColor: '#f00',
        textColor: 'black',
        imageProportion: '1:1',
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
        title: '#f00f',
        description: '3) Должен быть красный градиент',
        gradientColor: '#f00f',
        textColor: 'white',
        imageProportion: '1:1',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }, {
        id: 4,
        parent: null,
        type: null,
        title: '#ff0000',
        description: '4) Должен быть красный градиент',
        gradientColor: '#ff0000',
        textColor: 'white',
        imageProportion: '1:1',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }, {
        id: 4,
        parent: null,
        type: null,
        title: '#ff0000ff',
        description: '4) Должен быть красный градиент',
        gradientColor: '#ff0000ff',
        textColor: 'white',
        imageProportion: '1:1',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }, {
        id: 5,
        parent: null,
        type: null,
        title: 'rgb(255,0,0)',
        description: '5) Должен быть красный градиент',
        gradientColor: 'rgb(255,0,0)',
        textColor: 'white',
        imageProportion: '1:1',
        titleLines: 1,
        imagePosition: 'top',
        imageViewMode: 'rectangle',
        'parent@': null,
        imageHeight: 's',
        image: explorerImages[8],
        isShadow: true
    }, {
        id: 6,
        parent: null,
        type: null,
        title: 'rgba(255, 0, 0, 1)',
        description: '6) Должен быть красный градиент',
        gradientColor: 'rgba(255, 0, 0, 1)',
        textColor: 'white',
        imageProportion: '1:1',
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
    protected _items: RecordSet;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
