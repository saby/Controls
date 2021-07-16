import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/PreviewTemplate/ItemActionsMenu/Template';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from 'Controls-demo/tileNew/DataHelpers/DataCatalog';

const DATA = Gadgets.getPreviewItems();

const ACTIONS = [
    {
        id: 1,
        icon: 'icon-DownloadNew',
        title: 'download',
        showType: 0
    },
    {
        id: 2,
        icon: 'icon-Signature',
        title: 'signature',
        showType: 0
    },
    {
        id: 3,
        icon: 'icon-Print',
        title: 'print',
        showType: 0
    },
    {
        id: 4,
        icon: 'icon-Link',
        title: 'link',
        showType: 0
    },
    {
        id: 5,
        icon: 'icon-Edit',
        title: 'edit',
        showType: 0
    },
    {
        id: 6,
        icon: 'icon-Copy',
        title: 'copy',
        showType: 0
    },
    {
        id: 7,
        icon: 'icon-Paste',
        title: 'phone',
        showType: 0
    },
    {
        id: 8,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: 0
    },
    {
        id: 9,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: 0
    }
];

const ACTIONS_FEW = ACTIONS.slice(0, 2);

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _fullActions: any[] = ACTIONS;
    protected _fewActions: any[] = ACTIONS_FEW;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/tileNew/TileScalingMode/style'];
}
