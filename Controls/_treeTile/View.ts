import { View as TileView } from 'Controls/tile';
import { TreeControl } from 'Controls/tree';
import {TemplateFunction} from 'UI/Base';
import TreeTileView from './TreeTileView';

export default class View extends TileView {
    protected _viewName: TemplateFunction = TreeTileView;
    protected _viewTemplate: TemplateFunction = TreeControl;

    protected _getModelConstructor(): string {
        return 'Controls/treeTile:TreeTileCollection';
    }
}
