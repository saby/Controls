/**
 * Библиотека контрола каталога
 * @library Controls/newBrowser
 * @includes Browser Controls/_newBrowser/Browser
 * @includes ListItemTemplate Controls/_newBrowser/templates/ListItemTemplate
 * @includes TileItemTemplate Controls/_newBrowser/templates/TileItemTemplate
 * @includes IOptions Controls/_newBrowser/interfaces/IOptions
 * @includes TileSize Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes ITileConfig Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes IListConfig Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes ITableConfig Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes NodesPosition Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes ImageGradient Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes ImageViewMode Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes ListImagePosition Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes TileImagePosition Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes IBrowserViewConfig Controls/_newBrowser/interfaces/IBrowserViewConfig
 * @includes IMasterOptions Controls/_newBrowser/interfaces/IMasterOptions
 * @includes IDetailOptions Controls/_newBrowser/interfaces/IDetailOptions
 * @includes DetailViewMode Controls/_newBrowser/interfaces/IDetailOptions
 * @includes IRootsData Controls/_newBrowser/interfaces/IRootsData
 * @includes BeforeChangeRootResult Controls/_newBrowser/interfaces/IRootsData
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
export {IOptions} from './_newBrowser/interfaces/IOptions';
export {IMasterOptions} from './_newBrowser/interfaces/IMasterOptions';
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
