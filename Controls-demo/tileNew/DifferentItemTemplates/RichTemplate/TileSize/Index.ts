import {Control, TemplateFunction} from 'UI/Base';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/TileSize/Template';
import {HierarchicalMemory} from 'Types/source';

const data = [
    {
        key: 0,
        parent: null,
        type: null,
        title: 'Папка',
        image: explorerImages[8],
        'parent@': true,
        imageProportion: '1:1',
        imageViewMode: 'circle',
        imagePosition: 'top'
    },
    {
        key: 1,
        parent: null,
        type: null,
        title: 'Папка',
        image: explorerImages[8],
        'parent@': true,
        imageProportion: '1:1',
        imageViewMode: 'rectangle',
        imagePosition: 'top'
    },
    {
        key: 2,
        parent: null,
        type: null,
        title: 'Папка',
        image: explorerImages[8],
        'parent@': true,
        imageProportion: '1:1',
        imageViewMode: 'ellipse',
        imagePosition: 'top'
    },
    {
        key: 3,
        parent: null,
        'parent@': null,
        type: null,
        title: 'Запись',
        image: explorerImages[8],
        description: 'Элемент с описанием',
        imageProportion: '1:1',
        imagePosition: 'top',
        imageViewMode: 'circle'
    },
    {
        key: 4,
        parent: null,
        'parent@': null,
        type: null,
        title: 'Запись',
        image: explorerImages[8],
        description: 'Элемент с описанием',
        imageProportion: '1:1',
        imagePosition: 'top',
        imageViewMode: 'rectangle'
    },
    {
        key: 5,
        parent: null,
        'parent@': null,
        type: null,
        title: 'Запись',
        image: explorerImages[8],
        description: 'Элемент с описанием',
        imageProportion: '1:1',
        imagePosition: 'top',
        imageViewMode: 'ellipse'
    }];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];
    protected _sizes = ['s', 'm', 'l'];
    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
