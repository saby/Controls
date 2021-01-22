import {isFullGridSupport} from 'Controls/display';
import { default as View } from 'Controls/_gridNew/Grid';
import GridView from 'Controls/_gridNew/GridView';

import * as GridItemTemplate from 'wml!Controls/_gridNew/Render/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_gridNew/Render/table/Item';

import * as TableTemplate from 'wml!Controls/_gridNew/Render/table/GridView';
// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной один раз присвоится значение и не будет меняться.
//  В таком случае возникает ошибка при открытии одной страницы из разных браузеров (Chrome и IE), с сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу.
//  Данным хахом мы подменяем шаблонную функцию и возвращаем правильную. Тоже самое, что вынести в отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return isFullGridSupport() ? GridItemTemplate.apply(this, arguments) : TableItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;

import * as ColumnTemplate from 'wml!Controls/_gridNew/Render/CellContent';
import * as StickyLadderColumnTemplate from 'wml!Controls/_gridNew/Render/grid/StickyLadderColumn';
import * as GroupTemplate from 'wml!Controls/_gridNew/Render/GroupTemplate';
import * as HeaderContent from 'wml!Controls/_gridNew/Render/HeaderCellContent';
import * as ResultColumnTemplate from 'wml!Controls/_gridNew/Render/ResultsCellContent';
import * as ResultsTemplate from 'wml!Controls/_gridNew/Render/ResultsCellContent';
import * as FooterContent from 'wml!Controls/_gridNew/Render/FooterCellContent';
import * as EmptyTemplate from 'wml!Controls/_gridNew/Render/EmptyCellContent';
import * as EmptyColumnTemplate from 'wml!Controls/_gridNew/Render/EmptyCellContent';
import * as ItemActionsCellContent from 'wml!Controls/_gridNew/Render/ItemActionsCellContent';

import * as MoneyTypeRender from 'wml!Controls/_gridNew/Render/types/money';
import * as NumberTypeRender from 'wml!Controls/_gridNew/Render/types/number';
import * as StringTypeRender from 'wml!Controls/_gridNew/Render/types/string';

import SortingButton from 'Controls/_gridNew/SortingButton';
import {register} from "Types/di";

export {
    View,
    GridView,
    ItemTemplate,
    ResultsTemplate,
    ResultColumnTemplate,
    ColumnTemplate,
    StickyLadderColumnTemplate,
    GroupTemplate,
    HeaderContent,
    FooterContent,
    ItemActionsCellContent,
    EmptyTemplate,
    EmptyColumnTemplate,
    MoneyTypeRender,
    NumberTypeRender,
    StringTypeRender,
    TableTemplate,
    SortingButton
};

import {
    default as GridCollection,
    IOptions as IGridCollectionOptions
} from 'Controls/_gridNew/display/Collection';
export { default as GridMixin, TColspanCallbackResult, TColspanCallback, TResultsColspanCallback, IEmptyTemplateColumn } from 'Controls/_gridNew/display/mixins/Grid';
export { default as GridRowMixin } from 'Controls/_gridNew/display/mixins/Row';

import GridRow, {IOptions as IGridRowOptions} from 'Controls/_gridNew/display/Row';
import GridCell, {IOptions as IGridCellOptions} from 'Controls/_gridNew/display/Cell';
import GridHeader, {IOptions as IGridHeaderOptions} from 'Controls/_gridNew/display/Header';
import GridHeaderRow, {IOptions as IGridHeaderRowOptions} from 'Controls/_gridNew/display/HeaderRow';
import GridHeaderCell, {IOptions as IGridHeaderCellOptions} from 'Controls/_gridNew/display/HeaderCell';

import GridEmptyRow, {IOptions as IGridEmptyRowOptions} from 'Controls/_gridNew/display/EmptyRow';
import GridEmptyCell, {IOptions as IGridEmptyCellOptions} from 'Controls/_gridNew/display/EmptyCell';

import GridTableHeader from 'Controls/_gridNew/display/TableHeader';
import GridTableHeaderRow from 'Controls/_gridNew/display/TableHeaderRow';

import GridDataRow, {IOptions as IGridDataRowOptions} from 'Controls/_gridNew/display/DataRow';
import GridDataCell, {IOptions as IGridDataCellOptions} from 'Controls/_gridNew/display/DataCell';

import GridResultsRow, {IOptions as IGridResultsRowOptions} from 'Controls/_gridNew/display/ResultsRow';
import GridResultsCell, {IOptions as IGridResultsCellOptions} from 'Controls/_gridNew/display/ResultsCell';

import GridFooterRow, {IOptions as IGridFooterRowOptions} from 'Controls/_gridNew/display/FooterRow';
import GridFooterCell, {IOptions as IGridFooterCellOptions} from 'Controls/_gridNew/display/FooterCell';
import GridGroupItem, {IOptions as IGridGroupItemOptions} from 'Controls/_gridNew/display/GroupItem';

register('Controls/gridNew:GridCollection', GridCollection, {instantiate: false});
register('Controls/gridNew:GridRow', GridRow, {instantiate: false});
register('Controls/gridNew:GridCell', GridCell, {instantiate: false});
register('Controls/gridNew:GridHeader', GridHeader, {instantiate: false});
register('Controls/gridNew:GridTableHeader', GridTableHeader, {instantiate: false});
register('Controls/gridNew:GridHeaderRow', GridHeaderRow, {instantiate: false});
register('Controls/gridNew:GridTableHeaderRow', GridTableHeaderRow, {instantiate: false});
register('Controls/gridNew:GridHeaderCell', GridHeaderCell, {instantiate: false});
register('Controls/gridNew:GridEmptyRow', GridEmptyRow, {instantiate: false});
register('Controls/gridNew:GridEmptyCell', GridEmptyCell, {instantiate: false});
register('Controls/gridNew:GridDataRow', GridDataRow, {instantiate: false});
register('Controls/gridNew:GridDataCell', GridDataCell, {instantiate: false});
register('Controls/gridNew:GridFooterCell', GridFooterCell, {instantiate: false});
register('Controls/gridNew:GridResultsCell', GridResultsCell, {instantiate: false});

export {
    GridCollection, IGridCollectionOptions,
    GridRow, IGridRowOptions,
    GridCell, IGridCellOptions,
    GridHeader, IGridHeaderOptions,
    GridHeaderRow, IGridHeaderRowOptions,
    GridHeaderCell, IGridHeaderCellOptions,
    GridEmptyRow, IGridEmptyRowOptions,
    GridEmptyCell, IGridEmptyCellOptions,
    GridTableHeader,
    GridTableHeaderRow,
    GridDataRow, IGridDataRowOptions,
    GridDataCell, IGridDataCellOptions,
    GridResultsRow, IGridResultsRowOptions,
    GridResultsCell, IGridResultsCellOptions,
    GridFooterRow, IGridFooterRowOptions,
    GridFooterCell, IGridFooterCellOptions,
    GridGroupItem, IGridGroupItemOptions
}
