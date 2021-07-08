import { ListControl as viewTemplate, View as List } from 'Controls/list';
import * as GridView from 'Controls/_grid/GridView';
import GridViewTable from 'Controls/_grid/GridViewTable';
import { isFullGridSupport } from 'Controls/display';
import { TemplateFunction } from 'UI/Base';

/**
 * Контрол "Таблица" позволяет отображать данные из различных источников в виде таблицы.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_grid.less переменные тем оформления grid}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_list.less переменные тем оформления list}
 *
 * @class Controls/_grid/Grid
 * @extends Controls/list:View
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/grid:IPropStorage
 * @mixes Controls/marker:IMarkerList
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/grid/Base/Index
 */

/*
 * Table-looking list. Can load data from data source.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
 * List of examples:
 * <ul>
 *    <li><a href="/materials/Controls-demo/app/Controls-demo%2FList%2FGrid%2FEditableGrid">How to configure editing in your list</a>.</li>
 * </ul>
 *
 * @class Controls/_grid/Grid
 * @extends Controls/list:View
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:ISorting
 * @mixes Controls/grid:IGridControl
 * @mixes Controls/interface/IGridItemTemplate
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/grid:IPropStorage
 * @mixes Controls/marker:IMarkerList
 *
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/grid/Base/Index
 */
export default class Grid extends List {
    protected _viewName: TemplateFunction = null;
    protected _viewTemplate: TemplateFunction = viewTemplate;

    _beforeMount(options): Promise<void> {
        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? GridView : GridViewTable;
        return superResult;
    }

    protected _getModelConstructor(): string {
        return 'Controls/grid:GridCollection';
    }
}

Grid.getDefaultOptions = function() {
   return {
       stickyHeader: true,
       stickyColumnsCount: 1,
       rowSeparatorSize: null,
       columnSeparatorSize: null,
       isFullGridSupport: isFullGridSupport()
   };
};

Object.defineProperty(Grid, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Grid.getDefaultOptions();
   }
});

/**
 * @name Controls/_grid/Grid#itemPadding
 * @cfg {Controls/_list/interface/IList/ItemPadding.typedef}
 * @demo Controls-demo/grid/ItemPaddingNull/Index
 */