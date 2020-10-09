import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Popup/Loader/Template';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _record: Model;
    private _attachments: RecordSet;

    protected _beforeMount(options): void {
        if (options.prefetchPromise) {
            options.prefetchPromise.then((loaderMap) => {
                loaderMap['Controls-demo/Popup/Loader/Loaders/recordLoader'].then((record) => {
                    this._setRecord(record);
                });
                loaderMap['Controls-demo/Popup/Loader/Loaders/attachmentLoader'].then((attachments) => {
                    this._attachments = attachments;
                });
            });
        }
    }

    _setRecord(record: Model): void {
        this._record = record;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
