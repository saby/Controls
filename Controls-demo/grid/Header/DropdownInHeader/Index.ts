import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Header/DropdownInHeader/DropdownInHeader';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _dropdownSource: Memory;
    private _gridCaption = 'Характеристики стран';
    private _columns = getCountriesStats().getColumnsWithWidths().slice(1, 4);

    protected _beforeMount() {

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 10)
        });

        this._dropdownSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 1,
                    parent: null,
                    itemType: false,
                    title: 'Добавить страну'
                },
                {
                    id: 2,
                    parent: null,
                    itemType: false,
                    title: 'Добавить регион'
                }
            ]
        });
    }
}
