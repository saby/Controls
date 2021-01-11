import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/EditingRow/EditingRow';
import {Memory} from 'Types/source';
import {getPorts} from '../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import * as cellTemplate from 'wml!Controls-demo/gridNew/EditInPlace/EditingRow/cellTemplate';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _documentSignMemory: Memory;
    private data: object[] = getPorts().getData().map((cur) => this.getData(cur));
    protected selectedKey: number = 1;
    protected _fakeId: number = 100;

    private getData(data: object): object {
        for (const key in data) {
            if (data[key]) {
                data[key] = '' + data[key];
            } else {
                data[key] = '';
            }

        }
        return data;
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.data
        });

        this._cellTemplate = cellTemplate;

        this._documentSignMemory = new Memory({
            keyProperty: 'id',
            data: getPorts().getDocumentSigns()
        });
    }

    protected _colspanCallback(item, column, columnIndex, isEditing) {
        if (isEditing && columnIndex === 0) {
            return 'end';
        }
    }

    protected _onBeforeBeginEdit(e, options, isAdd) {
        if (isAdd && !options.item) {
            return {
                item: new Model({
                    keyProperty: 'id',
                    rawData: {
                        id: ++this._fakeId,
                        name: '',
                        invoice: 0,
                        documentSign: 0,
                        documentNum: 0,
                        taxBase: 0,
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

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
