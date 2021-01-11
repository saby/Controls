/**
 * Библиотека контрола каталога
 * @library Controls/newBrowser
 * @includes Browser Controls/_newBrowser/Browser
 * @includes ListItemTemplate Controls/_newBrowser/templates/ListItemTemplate
 * @includes TileItemTemplate Controls/_newBrowser/templates/TileItemTemplate
 * @includes IOptions Controls/_newBrowser/interfaces/IOptions
 * @includes TileSize Controls/_newBrowser/interfaces/IListConfiguration
 * @includes ImageEffect Controls/_newBrowser/interfaces/IListConfiguration
 * @includes ItemViewMode Controls/_newBrowser/interfaces/IListConfiguration
 * @includes ImagePosition Controls/_newBrowser/interfaces/IListConfiguration
 * @includes ImageViewMode Controls/_newBrowser/interfaces/IListConfiguration
 * @includes BackgroundStyle Controls/_newBrowser/interfaces/IListConfiguration
 * @includes IListConfiguration Controls/_newBrowser/interfaces/IListConfiguration
 * @includes IMasterOptions Controls/_newBrowser/interfaces/IMasterOptions
 * @includes IDetailOptions Controls/_newBrowser/interfaces/IDetailOptions
 * @includes CatalogDetailViewMode Controls/_newBrowser/interfaces/IDetailOptions
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
export {IDetailOptions, CatalogDetailViewMode} from './_newBrowser/interfaces/IDetailOptions';
export {
    TileSize,
    ImageEffect,
    ItemViewMode,
    ImagePosition,
    ImageViewMode,
    BackgroundStyle,
    IListConfiguration
} from './_newBrowser/interfaces/IListConfiguration';
