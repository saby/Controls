import {Memory} from 'Types/source';
import {Control, TemplateFunction} from 'UI/Base';
import {CatalogDetailViewMode} from 'Controls/newBrowser';
import {FlatHierarchy} from 'Controls-demo/_DemoData/Data';
import {DemoSource} from 'Controls-demo/NewBrowser/DemoSource';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/NewBrowser/Index';

const baseSource = new DemoSource({
    keyProperty: 'id',
    parentProperty: 'parent',
    data: FlatHierarchy.getData()
});

export default class extends Control {
    protected _template: TemplateFunction = Template;

    /**
     * Источник данных для колонок каталога
     */
    protected _baseSource: DemoSource = baseSource;

    /**
     * Источник данных для выбора режима отображения списка в detail-колонке
     */
    protected _viewModeSource: Memory = new Memory({
        keyProperty: 'key',
        data: [
            {
                title: 'Список',
                icon: 'icon-ArrangeList',
                key: CatalogDetailViewMode.list
            },
            {
                title: 'Плитка',
                icon: 'icon-ArrangePreview',
                key: CatalogDetailViewMode.tile
            },
            {
                title: 'Таблица',
                icon: 'icon-Table',
                key: CatalogDetailViewMode.table
            }
        ]
    });

    /**
     * Текущий режим отображения контента в master-колонке
     */
    protected _viewMode: CatalogDetailViewMode[] = [CatalogDetailViewMode.list];

    protected get _vm(): CatalogDetailViewMode {
        return this._viewMode[0];
    }
    protected set _vm(value: CatalogDetailViewMode) {
        this._viewMode = [value];
    }

    /**
     * Флаг, идентифицирующий видна или нет master-колонка
     */
    protected _isMasterVisible: boolean = false;

    /**
     * Набор колонок, отображаемый в master
     */
    protected _masterTableColumns: unknown[] = FlatHierarchy.getGridColumns(1);

    /**
     * Фильтр по которому отбираются только узлы в master-колонке
     */
    protected _masterFilter: {[key: string]: unknown} = {type: [true, false]};

    protected _detailFilter: {[key: string]: unknown} = {};

    /**
     * Набор колонок, отображаемый в detail
     */
    protected _detailTableColumns: unknown[] = FlatHierarchy.getGridColumns();

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
