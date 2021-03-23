import { View as TileView } from 'Controls/tileNew';
import {TemplateFunction} from 'UI/Base';
import TreeTileView from './TreeTileView';

export default class View extends TileView {
    protected _viewName: TemplateFunction = TreeTileView;

    protected _getModelConstructor(): string {
        return 'Controls/treeTile:TreeTileCollection';
    }
}
