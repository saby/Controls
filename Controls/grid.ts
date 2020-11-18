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
 * @includes EditingEmptyTemplate Controls/grid:EditingEmptyTemplate
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_grid/Grid';
import * as GridLayoutUtil from './_grid/utils/GridLayoutUtil';

import GridLayoutItemTemplate = require('wml!Controls/_grid/layout/grid/Item');
import TableLayoutItemTemplate = require('wml!Controls/_grid/layout/table/Item');
const ItemTemplate = GridLayoutUtil.isFullGridSupport() ? GridLayoutItemTemplate : TableLayoutItemTemplate;

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
    ICellPadding,
    TCellAlign,
    TCellPaddingVariant,
    TCellVerticalAlign,
    TOverflow
} from './_grid/interface/IColumn';

export {ITagColumn} from './_grid/interface/ITagColumn';

export {IGridControl} from './_grid/interface/IGridControl';

export {
    THeader,
    IHeaderCell
} from './_grid/interface/IHeaderCell';

export {
    JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS,
    ColumnScroll,
    IColumnScrollOptions
} from './_grid/resources/ColumnScroll';

export {
    JS_SELECTORS as DRAG_SCROLL_JS_SELECTORS
} from './_grid/resources/DragScroll';
