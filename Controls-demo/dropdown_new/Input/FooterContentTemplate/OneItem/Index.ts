import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/FooterContentTemplate/OneItem/Index');
import {Memory} from 'Types/source';

class SearchFlat extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                { id: 1, title: 'All directions' }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default SearchFlat;
