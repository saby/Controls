import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/resources/Editors/Additional/Select';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: unknown[] = [];

    protected _beforeMount(options): void {
        return options.item.editorOptions.source.query().then((result) => {
            this._items = result.getAll();
        });
    }
}
