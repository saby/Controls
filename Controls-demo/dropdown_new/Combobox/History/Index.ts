import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/dropdown_new/Combobox/History/Index';
import {createMemory} from './HistorySourceCombobox';
import {Source} from 'Controls/history';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Source;
    protected _selectedKey: string = '1';

    protected _beforeMount(): void {
        this._source = createMemory();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
