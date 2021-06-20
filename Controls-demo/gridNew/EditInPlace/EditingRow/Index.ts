import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/EditingRow/EditingRow';
import {Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import * as cellTemplate from 'wml!Controls-demo/gridNew/EditInPlace/EditingRow/cellTemplate';
import {Ports} from 'Controls-demo/gridNew/DemoHelpers/Data/Ports';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _documentSignMemory: Memory;
    private selectedKey: number = 1;
    private _fakeId: number = 100;
    private _cellTemplate: TemplateFunction;
    private _mouseDownLog: string[] = [];
    private data: object[] = Ports.getData().map((cur) => this.getData(cur));

    private getData(data: object): object {
        for (const key in data) {
            data[key] = `${data[key]}` || '';
        }
        return data;
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.data
        });

        this._cellTemplate = cellTemplate;

        this._documentSignMemory = new Memory({
            keyProperty: 'key',
            data: Ports.getDocumentSigns()
        });
    }

    protected _colspanCallback(item, column, columnIndex, isEditing): 'end' {
        if (isEditing && columnIndex === 0) {
            return 'end';
        }
    }

    protected _onBeforeBeginEdit(e, options, isAdd) {
        if (isAdd && !options.item) {
            return {
                item: new Model({
                    keyProperty: 'key',
                    rawData: {
                        key: ++this._fakeId,
                        name: '',
                        invoice: '0',
                        documentSign: '0',
                        documentNum: '0',
                        taxBase: '0',
                        document: '',
                        documentDate: null,
                        serviceContract: null,
                        description: '',
                        shipper: null
                    }
                })
            };
        }
    }

    private onChange1 = (_: SyntheticEvent, name: string, item: Model, value: number): void => {
        item.set(name, value);
    }

    private onChange2 = (_: SyntheticEvent, key: number): void => {
        this.selectedKey = key;
    }

    _onMouseDown() {
        this._mouseDownLog.push('on:mousedown');
    }

    _clearLog = () => {
        this._mouseDownLog = [];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
