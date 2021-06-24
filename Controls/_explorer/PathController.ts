import {EventUtils} from 'UI/Events';
import {Path} from 'Controls/dataSource';
import HeadingPathBack from 'Controls/_explorer/HeadingPathBack';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_explorer/PathController/PathController';
import { IGridControl, IHeaderCell } from 'Controls/interface';
import {TExplorerViewMode} from 'Controls/_explorer/interface/IExplorer';

interface IOptions extends IControlOptions, IGridControl {
    breadCrumbsItems: Path;
    rootVisible: boolean;
    displayProperty: string;
    showActionButton: boolean;
    backButtonStyle: string;
    backButtonCaption: string;
    backButtonIconStyle: string;
    backButtonFontColorStyle: string;
    viewMode?: TExplorerViewMode;
}

function isItemsEqual(oldItems: Path, newItems: Path): boolean {
    if ((!oldItems && newItems) || (oldItems && !newItems)) {
        return false;
    }

    if (!oldItems && !newItems) {
        return true;
    }

    return oldItems.length === newItems.length &&
        oldItems.reduce((acc, prev, index) => acc && prev.isEqual(newItems[index]), true);
}

/**
 * * Если возможно, то патчит первую ячейку заголовка таблицы добавляя туда хлебные крошки
 * * Вычисляет нужна ли тень у хлебных крошек
 * * Обрабатывает клик по кнопке назад из заголовка таблицы
 * * Предоставляет метод goBack, который инициирует возвращение на предыдущий уровень в иерархии проваливания
 */
export default class PathController extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    protected _header: IHeaderCell[];
    protected _needShadow: boolean = false;

    protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;

    protected _beforeMount(options: IOptions): void {
        // Пропатчим первую колонку хлебными крошками если надо
        this._header = PathController._getHeader(options, options.breadCrumbsItems);
        this._needShadow = PathController._isNeedShadow(this._header, options.viewMode);
    }

    protected _beforeUpdate(newOptions: IOptions): void {
        const headerChanged = !GridIsEqualUtil.isEqualWithSkip(
            this._options.header,
            newOptions.header,
            { template: true }
        );

        if (
            headerChanged ||
            !isItemsEqual(this._options.breadCrumbsItems, newOptions.breadCrumbsItems) ||
            this._options.rootVisible !== newOptions.rootVisible ||
            this._options.multiSelectVisibility !== newOptions.multiSelectVisibility
        ) {
            this._header = PathController._getHeader(newOptions, newOptions.breadCrumbsItems);
            this._needShadow = PathController._isNeedShadow(this._header, newOptions.viewMode);
        }

        if (this._options.viewMode !== newOptions.viewMode) {
            this._needShadow = PathController._isNeedShadow(this._header, newOptions.viewMode);
        }
    }

    /**
     * Инициирует возвращение на предыдущий уровень в иерархии проваливания
     */
    goBack(e: Event): void {
        require(['Controls/breadcrumbs'], (breadcrumbs) => {
            breadcrumbs.HeadingPathCommon.onBackButtonClick.call(this, e, 'breadCrumbsItems');
        });
    }

    /**
     * Патчит первую ячейку заголовка таблицы добавляя туда хлебные крошки
     * если не задан пользовательский контент для этой ячейки.
     */
    private static _getHeader(options: IOptions, items: Path): IHeaderCell[] {
        let newHeader = options.header;
        // title - устаревшее поле колонки
        const firstHeaderCell = options.header?.length && options.header[0] as IHeaderCell & {title: string};

        // Если пользовательский контент первой ячейки заголовка не задан, то
        // то задаем наш шаблон с хлебными крошками
        if (
            options.breadcrumbsVisibility !== 'hidden' &&
            firstHeaderCell &&
            !(firstHeaderCell.title || firstHeaderCell.caption) &&
            !firstHeaderCell.template
        ) {
            newHeader = options.header.slice();
            newHeader[0] = {
                ...options.header[0],
                template: HeadingPathBack,
                templateOptions: {
                    showActionButton: !!options.showActionButton,
                    showArrowOutsideOfBackButton: !!options.showActionButton,
                    backButtonStyle: options.backButtonStyle,
                    backButtonIconStyle: options.backButtonIconStyle,
                    backButtonFontColorStyle: options.backButtonFontColorStyle,
                    displayProperty: options.displayProperty,
                    backButtonCaption: options.backButtonCaption,
                    items
                },

                // TODO: удалить эту опцию после
                //  https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
                isBreadCrumbs: true
            };
        }

        return newHeader;
    }

    /**
     * Определяет нужно ли рисовать тень у StickyHeader в котором лежат хлебные крошки
     */
    private static _isNeedShadow(header: IHeaderCell[], viewModel: TExplorerViewMode): boolean {
        // В табличном представлении если есть заголовок, то тень будет под ним,
        // и нам не нужно рисовать ее под хлебными крошками. В противном случае
        // тень у StickyHeader нужна всегда.
        return viewModel !== 'table' || !header;
    }
}
