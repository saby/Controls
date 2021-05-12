import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/NewBrowser/LayoutWithBrowser/template';
import {Memory} from 'Types/source';
import {object} from 'Types/util';
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
        this._listConfigurations = [
        {
            id: 'detail',
            source: this._baseSource,
            root: null,
            searchParam: 'title',
            keyProperty: 'id',
            nodeProperty: 'type',
            parentProperty: 'parent',
            hasChildrenProperty: 'hasChild',
            columns: this._detailTableColumns,
            filterButtonSource: [
                {
                    name: 'country',
                    value: 'США',
                    resetValue: 'США',
                    viewMode: 'frequent',
                    editorOptions: {
                        keyProperty: 'key',
                        displayProperty: 'title',
                        source: new Memory({
                            keyProperty: 'key',
                            data: [{title: 'США', key: 'США'}, {title: 'Южная Корея', key: 'Южная Корея'}]
                        })
                    }
                }
            ]
        },
            {
                id: 'master',
                source: this._baseSource,
                root: null,
                keyProperty: 'id',
                nodeProperty: 'type',
                parentProperty: 'parent',
                hasChildrenProperty: 'hasChild',
                style: 'master',
                columns: this._masterTableColumns
            }];
    }

    protected _rootChanged(event, root, id): void {
        this._listConfigurations = object.clone(this._listConfigurations);
        this._listConfigurations[0].root = root;
    }

    protected _filterChanged(event, filter, id): void {
        this._listConfigurations = object.clone(this._listConfigurations);
        this._listConfigurations[0].filter = filter;
    }
}
