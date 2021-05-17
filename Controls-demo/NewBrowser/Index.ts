import {Memory} from 'Types/source';
import {Control, TemplateFunction} from 'UI/Base';
import {BeforeChangeRootResult, Browser, DetailViewMode, IBrowserViewConfig, IRootsData} from 'Controls/newBrowser';
import {FlatHierarchy} from 'Controls-demo/DemoData';
import {DemoSource, getDefaultViewCfg} from 'Controls-demo/NewBrowser/DemoSource';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/NewBrowser/Index';
import { SyntheticEvent } from 'UICommon/Events';
import {TKey} from 'Controls/_interface/IItems';

const baseSource = new DemoSource({
    keyProperty: 'id',
    parentProperty: 'parent',
    data: FlatHierarchy.getData()
});

function findParentFolderId(itemId: TKey): TKey {
    if (!itemId) {
        return null;
    }
    const data = FlatHierarchy.getData();
    const item = data.find((dataItem) => dataItem.id === itemId);

    if (item.hasSubNodes) {
        return item.id;
    }

    if (item.parent === null) {
        return null;
    }

    const parent = data.find((dataItem) => dataItem.id === item.parent);
    if (parent.hasSubNodes) {
        return parent.id;
    }

    return findParentFolderId(parent.id);
}

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _children: {
        browser: Browser
    };

    /**
     * Корневая директория detail списка
     */
    protected _root: TKey = null;

    /**
     * Корневая директория master списка
     */
    protected _masterRoot: TKey = null;

    /**
     * Флаг, идентифицирующий видна или нет master-колонка
     */
    protected _isMasterVisible: boolean = true;

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
                key: DetailViewMode.list
            },
            {
                title: 'Плитка',
                icon: 'icon-ArrangePreview',
                key: DetailViewMode.tile
            },
            {
                title: 'Таблица',
                icon: 'icon-Table',
                key: DetailViewMode.table
            }
        ]
    });
    protected _viewMode: DetailViewMode = DetailViewMode.list;
    protected _userViewMode: DetailViewMode[] = [DetailViewMode.list];
    protected _defaultViewCfg: IBrowserViewConfig = getDefaultViewCfg();

    /**
     * Набор колонок, отображаемый в master
     */
    protected _masterTableColumns: unknown[] = FlatHierarchy.getGridColumns(1);

    /**
     * Фильтр по которому отбираются только узлы в master-колонке
     */
    protected _masterFilter: {[key: string]: unknown} = {type: [true, false]};

    /**
     * Набор колонок, отображаемый в detail
     */
    protected _detailTableColumns: unknown[] = FlatHierarchy.getGridColumns();

    //region life circle hooks
    protected _componentDidMount(options?: {}, contexts?: any): void {
        this._userViewMode = [this._children.browser.viewMode];
    }
    //endregion

    protected _onBeforeRootChanged(event: SyntheticEvent, roots: IRootsData): BeforeChangeRootResult {
        return {
            detailRoot: roots.detailRoot,
            masterRoot: findParentFolderId(roots.masterRoot)
        };
    }

    protected _onBrowserViewModeChanged(event: SyntheticEvent, viewMode: DetailViewMode): void {
        this._userViewMode = [viewMode];
    }

    protected _onUserViewModeChanged(event: SyntheticEvent, viewMode: DetailViewMode[]): void {
        if (this._children.browser.viewMode === viewMode[0]) {
            return;
        }

        this._viewMode = viewMode[0];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
