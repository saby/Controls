/**
 * Библиотека контролов, которые реализуют плоский список, отображающийся в виде таблицы.
 * @library Controls/grid
 * @includes ItemTemplate Controls/_grid/interface/ItemTemplate
 * @includes ResultsTemplate Controls/_grid/interface/ResultsTemplate
 * @includes GroupTemplate Controls/_grid/interface/GroupTemplate
 * @includes HeaderContent Controls/_grid/interface/HeaderContent
 * @includes LadderWrapper Controls/_grid/interface/LadderWrapper
 * @includes ColumnTemplate Controls/_grid/interface/ColumnTemplate
 * @includes ResultColumnTemplate Controls/_grid/interface/ResultColumnTemplate
 * @includes EditingEmptyTemplate Controls/_grid/interface/EditingEmptyTemplate
 * @includes IPropStorage Controls/_grid/interface/IPropStorage
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_grid/Grid';
import * as GridLayoutUtil from './_grid/utils/GridLayoutUtil';

import GridLayoutItemTemplate = require('wml!Controls/_grid/layout/grid/Item');
import TableLayoutItemTemplate = require('wml!Controls/_grid/layout/table/Item');

// FIXME: при обычном условном присвоении шаблона tmpl = isAny ? tmpl1 : tmpl2, переменной один раз присвоится значение и не будет меняться.
//  В таком случае возникает ошибка при открытии одной страницы из разных браузеров (Chrome и IE), с сервера всегда будет возвращаться один и тот же шаблон,
//  для того браузера, который первый открыл страницу.
//  Данным хахом мы подменяем шаблонную функцию и возвращаем правильную. Тоже самое, что вынести в отдельный шаблон и там условно вызвать паршл,
//  но быстрее по времени.
//  По словам Макса Крылова это ничего не сломает, если на функцию навесить флаги ядра.
//  Найти нормальное решение по https://online.sbis.ru/opendoc.html?guid=41a8dbab-93bb-4bc0-8533-6b12c0ec6d8d
const ItemTemplate = function() {
    return GridLayoutUtil.isFullGridSupport() ? GridLayoutItemTemplate.apply(this, arguments) : TableLayoutItemTemplate.apply(this, arguments);
};
ItemTemplate.stable = true;
ItemTemplate.isWasabyTemplate = true;

import ResultsTemplate = require('wml!Controls/_grid/ResultsTemplateResolver');
import GroupTemplate = require('wml!Controls/_grid/GroupTemplate');
import LadderWrapper = require('wml!Controls/_grid/LadderWrapper');
import ColumnTemplate = require('wml!Controls/_grid/layout/common/ColumnContent');
import ColumnLightTemplate = require('wml!Controls/_grid/layout/common/ColumnContentLight');

import HeaderContent = require('wml!Controls/_grid/HeaderContent');
import SortingButton from 'Controls/_grid/SortingButton';
import GridView = require('Controls/_grid/GridView');
import GridViewModel = require('Controls/_grid/GridViewModel');

import {default as SortingSelector, ISortingSelectorOptions} from 'Controls/_grid/SortingSelector';
import RowEditor = require('wml!Controls/_grid/RowEditor');
import * as ResultColumnTemplate from 'wml!Controls/_grid/layout/common/ResultCellContent';

import * as EditingEmptyTemplate from 'wml!Controls/_grid/emptyTemplates/Editing';

export {
    View,
    ItemTemplate,
    ResultsTemplate,
    ResultColumnTemplate,
    GroupTemplate,
    LadderWrapper,
    ColumnTemplate,
    ColumnLightTemplate,

    HeaderContent,
    SortingButton,
    GridView,
    GridViewModel,

    RowEditor,
    SortingSelector,
    ISortingSelectorOptions,

    EditingEmptyTemplate,

    GridLayoutUtil
};

export {
    TColumns,
    IColumn,
    IColspanParams,
    IRowspanParams,
    ICellPadding,
    TCellAlign,
    TCellPaddingVariant,
    TCellVerticalAlign,
    TOverflow,
    IColumnSeparatorSizeConfig,
    TColumnSeparatorSize
} from './_grid/interface/IColumn';
export { TMarkerClassName } from 'Controls/_grid/interface/ColumnTemplate';

export {IGridControl} from './_grid/interface/IGridControl';

export {
    THeader,
    IHeaderCell
} from './_grid/interface/IHeaderCell';

export {
    COLUMN_SCROLL_JS_SELECTORS,
    DRAG_SCROLL_JS_SELECTORS,
    ColumnScrollController as ColumnScroll,
    IColumnScrollControllerOptions as IColumnScrollOptions
} from 'Controls/columnScroll';
