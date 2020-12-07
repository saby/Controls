import { isFullGridSupport } from 'Controls/display';
import { default as View } from 'Controls/_gridNew/Grid';
import GridView from 'Controls/_gridNew/GridView';

import * as GridItemTemplate from 'wml!Controls/_gridNew/Render/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_gridNew/Render/table/Item';

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
import * as EmptyTemplate from 'wml!Controls/_gridNew/Render/EmptyTemplate';


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
    EmptyTemplate
};
