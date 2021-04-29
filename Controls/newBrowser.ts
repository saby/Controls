/**
 * Библиотека содержит контрол и вспомогательные структуры данных с помощью которых вы можете
 * реализовать двухколоночный реестр в виде master-detail списка. Где в левой/master колонке
 * содержится иерархический список с деревом каталогов, а в правой/detail колонке отображается
 * содержимое каталога выбранного в master колонке.
 *
 * @library Controls/newBrowser
 * @includes IMaster Controls/newBrowser:IMaster
 * @includes IDetail Controls/newBrowser:IDetail
 * @author Уфимцев Д.Ю.
 */
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as ListItemTemplate from 'wml!Controls/_newBrowser/templates/ListItemTemplate';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as TileItemTemplate from 'wml!Controls/_newBrowser/templates/TileItemTemplate';

export {
    ListItemTemplate,
    TileItemTemplate
};

export {default as Browser} from 'Controls/_newBrowser/Browser';
export {default as View} from 'Controls/_newBrowser/View/View';
export {IOptions} from './_newBrowser/interfaces/IOptions';
export {IMasterOptions, MasterVisibilityEnum} from './_newBrowser/interfaces/IMasterOptions';
export {IDetailOptions, DetailViewMode} from './_newBrowser/interfaces/IDetailOptions';
export {IRootsData, BeforeChangeRootResult} from './_newBrowser/interfaces/IRootsData';
export {
    TileSize,
    ITileConfig,
    IListConfig,
    ITableConfig,
    NodesPosition,
    ImageGradient,
    ImageViewMode,
    ListImagePosition,
    TileImagePosition,
    IBrowserViewConfig
} from './_newBrowser/interfaces/IBrowserViewConfig';
