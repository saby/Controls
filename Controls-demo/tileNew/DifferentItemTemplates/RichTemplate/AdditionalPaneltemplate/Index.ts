import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/AdditionalPaneltemplate/Template';
import {HierarchicalMemory} from 'Types/source';
import Images from 'Controls-demo/tileNew/DataHelpers/Images';
import {Model} from 'Types/entity';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';

const DATA = [{
    id: 0,
    parent: null,
    type: null,
    title: 'Мост',
    image: Images.BRIDGE,
    'parent@': true,
    description: 'папка с мостом',
    imageProportion: '1:1',
    imageViewMode: 'circle',
    imagePosition: 'top',
    gradientType: 'dark',
    isDocument: true,
    width: 300,
    isShadow: true
}, {
    id: 1,
    parent: null,
    type: null,
    title: 'Медведики',
    description: 'Элемент с описанием',
    imageProportion: '16:9',
    titleLines: 1,
    imagePosition: 'top',
    imageViewMode: 'rectangle',
    'parent@': null,
    imageHeight: 's',
    image: Images.MEDVED,
    isShadow: true
}];
const ITEM_ACTIONS = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: 0
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: 0
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];
    protected _itemActions: IItemAction[];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
        this._itemActions = ITEM_ACTIONS;
    }

    protected _setLove(e: Event, item: Model, value: boolean): void {
        item.set('love', value);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
