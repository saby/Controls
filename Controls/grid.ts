/**
 * Библиотека контролов, которые реализуют плоский список, отображающийся в виде таблицы.
 * @library Controls/grid
 * @includes View Controls/_grid/Grid
 * @includes ItemTemplate Controls/grid:ItemTemplate
 * @includes ResultsTemplate Controls/grid:ResultsTemplate
 * @includes GroupTemplate Controls/grid:GroupTemplate
 * @includes HeaderContent Controls/grid:HeaderContent
 * @includes LadderWrapper Controls/grid:LadderWrapper
 * @includes ColumnTemplate Controls/grid:ColumnTemplate
 * @includes ResultColumnTemplate Controls/grid:ResultColumnTemplate
 * @includes RowEditor Controls/grid:RowEditor
 * @includes IGridControl Controls/_grid/interface/IGridControl
 * @includes IColumn Controls/grid:IColumn
 * @includes IHeaderCell Controls/_grid/interface/IHeaderCell
 * @includes IPropStorage Controls/_grid/interface/IPropStorage
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_grid/Grid';
import GroupTemplate = require('wml!Controls/_grid/GroupTemplate');
import LadderWrapper = require('wml!Controls/_grid/LadderWrapper');
import ColumnTemplate = require('wml!Controls/_grid/layout/common/ColumnContent');
import ColumnLightTemplate = require('wml!Controls/_grid/layout/common/ColumnContentLight');

import HeaderContent = require('wml!Controls/_grid/HeaderContent');
import SortingButton from 'Controls/_grid/SortingButton';
import GridView = require('Controls/_grid/GridView');
import GridViewModel = require('Controls/_grid/GridViewModel');

import SortingSelector from 'Controls/_grid/SortingSelector';
import RowEditor = require('wml!Controls/_grid/RowEditor');
import * as ResultColumnTemplate from 'wml!Controls/_grid/layout/common/ResultCellContent';

import * as GridLayoutUtil from './_grid/utils/GridLayoutUtil';

const ItemTemplate = GridLayoutUtil.isFullGridSupport() ? require('wml!Controls/_grid/layout/grid/Item') : require('wml!Controls/_grid/layout/table/Item');
const ResultsTemplate = GridLayoutUtil.isFullGridSupport() ? require('wml!Controls/_grid/layout/grid/Results') : require('wml!Controls/_grid/layout/table/Results');

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

export {
    THeader,
    IHeaderCell
} from './_grid/interface/IHeaderCell';

export {
    JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS,
    ColumnScroll,
    IColumnScrollOptions
} from './_grid/resources/ColumnScroll';
