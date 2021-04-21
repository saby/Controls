import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/NewBrowser/LayoutWithBrowser/template';
import {DemoSource} from 'Controls-demo/NewBrowser/DemoSource';
import {FlatHierarchy} from 'Controls-demo/_DemoData/Data';
import {getListConfiguration} from '../ListConfiguration';

const baseSource = new DemoSource({
    keyProperty: 'id',
    parentProperty: 'parent',
    data: FlatHierarchy.getData()
});

export default class BrowserLayoutDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _baseSource: DemoSource = baseSource;
    protected _viewMode: string = 'list';
    protected _userViewMode: string = 'list';
    protected _listConfigurations = null;
    protected _defaultViewCfg = getListConfiguration();
    /**
     * Набор колонок, отображаемый в master
     */
    protected _masterTableColumns: unknown[] = FlatHierarchy.getGridColumns(1);

    /**
     * Фильтр по которому отбираются только узлы в master-колонке
     */
    protected _masterFilter: {[key: string]: unknown} = {type: [true, false]};
    protected _detailTableColumns: unknown[] = FlatHierarchy.getGridColumns();

    protected _beforeMount(): void {
        this._listConfigurations = [{
            id: 'master',
            source: this._baseSource,
            root: null,
            keyProperty: 'id',
            nodeProperty: 'type',
            parentProperty: 'parent',
            hasChildrenProperty: 'hasChild'
        },
        {
            id: 'detail',
            source: this._baseSource,
            root: null,
            searchParam: 'title',
            keyProperty: 'id',
            nodeProperty: 'type',
            parentProperty: 'parent',
            hasChildrenProperty: 'hasChild',
            filterButtonSource: [
                {
                    name: 'title',
                    value: undefined,
                    resetValue: undefined
                }
            ]
        }];
    }

    protected _rootChanged(event, root, id): void {
        this._listConfigurations = this._listConfigurations.slice();
        this._listConfigurations[1].root = root;
    }
}
