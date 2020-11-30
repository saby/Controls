import { isFullGridSupport } from 'Controls/display';
import { default as View } from 'Controls/_gridNew/Grid';

import * as GridItemTemplate from 'wml!Controls/_gridNew/Render/grid/Item';
import * as TableItemTemplate from 'wml!Controls/_gridNew/Render/table/Item';
const ItemTemplate = isFullGridSupport() ? GridItemTemplate : TableItemTemplate;

import * as ColumnTemplate from 'wml!Controls/_gridNew/Render/grid/Column';
import * as StickyLadderColumnTemplate from 'wml!Controls/_gridNew/Render/grid/StickyLadderColumn';
import * as GroupTemplate from 'wml!Controls/_gridNew/Render/GroupTemplate';
import * as HeaderContent from 'wml!Controls/_gridNew/Render/HeaderCellContent';
import * as ResultColumnTemplate from 'wml!Controls/_gridNew/Render/ResultsCellContent';
import * as ResultsTemplate from 'wml!Controls/_gridNew/Render/ResultsCellContent';
import * as FooterContent from 'wml!Controls/_gridNew/Render/FooterCellContent';
import * as EmptyTemplate from 'wml!Controls/_gridNew/Render/EmptyTemplate';


export {
    View,
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
