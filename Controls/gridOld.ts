/**
 * Библиотека контролов, которые реализуют плоский список, отображающийся в виде таблицы.
 * @library Controls/grid
 * @includes ItemTemplate Controls/_gridOld/interface/ItemTemplate
 * @includes ResultsTemplate Controls/_gridOld/interface/ResultsTemplate
 * @includes GroupTemplate Controls/_gridOld/interface/GroupTemplate
 * @includes HeaderContent Controls/_gridOld/interface/HeaderContent
 * @includes LadderWrapper Controls/_gridOld/interface/LadderWrapper
 * @includes ColumnTemplate Controls/_gridOld/interface/ColumnTemplate
 * @includes ResultColumnTemplate Controls/_gridOld/interface/ResultColumnTemplate
 * @includes EditingEmptyTemplate Controls/_gridOld/interface/EditingEmptyTemplate
 * @includes FooterTemplate Controls/_gridOld/interface/FooterTemplate
 * @includes EmptyTemplate Controls/_gridOld/interface/EmptyTemplate
 * @includes RowEditor Controls/_gridOld/interface/RowEditor
 * @includes IPropStorage Controls/_gridOld/interface/IPropStorage
 * @includes ITagColumn Controls/_gridOld/interface/ITagColumn
 * @includes SortingButton Controls/_gridOld/SortingButton
 * @public
 * @author Крайнов Д.О.
 */

import {default as View} from 'Controls/_gridOld/Grid';
import * as GridLayoutUtil from './_gridOld/utils/GridLayoutUtil';

import GridLayoutItemTemplate = require('wml!Controls/_gridOld/layout/grid/Item');
import TableLayoutItemTemplate = require('wml!Controls/_gridOld/layout/table/Item');

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

import ResultsTemplate = require('wml!Controls/_gridOld/ResultsTemplateResolver');
import GroupTemplate = require('wml!Controls/_gridOld/GroupTemplate');
import LadderWrapper = require('wml!Controls/_gridOld/LadderWrapper');
import ColumnTemplate = require('wml!Controls/_gridOld/layout/common/ColumnContent');
import ColumnLightTemplate = require('wml!Controls/_gridOld/layout/common/ColumnContentLight');

import HeaderContent = require('wml!Controls/_gridOld/HeaderContent');
import SortingButton from 'Controls/_gridOld/SortingButton';
import GridView = require('Controls/_gridOld/GridView');
import GridViewModel = require('Controls/_gridOld/GridViewModel');

import {default as SortingSelector, ISortingSelectorOptions} from 'Controls/_gridOld/SortingSelector';
import RowEditor = require('wml!Controls/_gridOld/RowEditor');
import * as ResultColumnTemplate from 'wml!Controls/_gridOld/layout/common/ResultCellContent';

import * as EditingEmptyTemplate from 'wml!Controls/_gridOld/emptyTemplates/Editing';

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
    COLUMN_SCROLL_JS_SELECTORS,
    DRAG_SCROLL_JS_SELECTORS,
    ColumnScrollController as ColumnScroll,
    IColumnScrollControllerOptions as IColumnScrollOptions
} from 'Controls/columnScroll';

export {
    IGridControl,
    TColumns,
    IColumn,
    IColspanParams,
    ICellPadding,
    TCellAlign,
    TCellPaddingVariant,
    TCellVerticalAlign,
    TOverflow,
    IColumnSeparatorSizeConfig,
    TColumnSeparatorSize,
    THeader,
    IHeaderCell
} from 'Controls/interface';
