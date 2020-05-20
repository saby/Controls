import {TemplateFunction, Control, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/OperationsPanelNew/PanelWithList/Marker/hidden/hidden';
import notifyHandler = require('Controls/Utils/tmplNotify');
import {SyntheticEvent} from 'Vdom/Vdom';
import {getPanelData, getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo';
import TreeMemory = require('Controls-demo/List/Tree/TreeMemory');
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';

const UNLOAD_OPERATION_KEY = 'save';

export default class ListWithoutMarker extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _selectedKeys: string[] = [];
    protected _excludedKeys: string[] = [];
    protected _notifyHandler: Function = notifyHandler;
    protected _expandedOperationsPanel: boolean = false;
    protected _panelSource: Memory = new Memory({
        keyProperty: 'id',
        data: getPanelData()
    });
    protected _gridColumns: object[] = [{
        template: 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo'
    }];
    protected _viewSource: TreeMemory = new TreeMemory({
        keyProperty: 'id',
        data: getListData()
    });

    protected _expandedChangedHandler(event: SyntheticEvent, expanded: boolean): void {
        this._expandedOperationsPanel = expanded;
        if (!expanded) {
            this._notify('selectedKeysChanged', [[], [], this._selectedKeys]);
        }
    }

    protected _showPopup(text: string): void {
        this._children.popupOpener.open({
            message: text,
            type: 'ok'
        });
    }

    protected _panelItemClick(event: SyntheticEvent, item: Model, nativeEvent: Event, selection: object): void {
        const itemId = item.get('id');

        if (itemId !== UNLOAD_OPERATION_KEY && this._children.baseAction.validate(selection)) {
            switch (itemId) {
                case 'PDF':
                case 'Excel':
                    this._showPopup('Выгрузка в ' + itemId);
                    break;
                case 'print':
                    this._showPopup('Печать');
                    break;
                case 'plainList':
                    this._showPopup('Развернуть без подразделений');
                    break;
                case 'sum':
                    this._showPopup('Суммирование');
                    break;
            }
        }
    }

    static _styles: string[] = ['Controls-demo/OperationsPanel/Demo/Demo'];
}
