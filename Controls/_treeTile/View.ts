import { View as TileView } from 'Controls/tile';
import { TreeControl } from 'Controls/tree';
import {TemplateFunction} from 'UI/Base';
import TreeTileView from './TreeTileView';

/**
 * Контрол "Иерархическая плитка" позволяет отображать данные из различных источников в виде элементов плитки с иерархией и располагать несколько элементов в одну строку. Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 *
 * @extends Controls/list:View
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IContentTemplate
 * @mixes Controls/interface/IGroupedList
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/tile:ITile
 * @mixes Controls/list:IClickableView
 * @mixes Controls/marker:IMarkerList
 * @mixes Controls/list:IVirtualScrollConfig
 * @mixes Controls/treeTile:ITreeTile 
 *
 * @author Панихин К.А.
 * @public
 */

export default class View extends TileView {
    protected _viewName: TemplateFunction = TreeTileView;
    protected _viewTemplate: TemplateFunction = TreeControl;

    protected _getModelConstructor(): string {
        return 'Controls/treeTile:TreeTileCollection';
    }
}
