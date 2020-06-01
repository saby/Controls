import TileView = require('Controls/_tile/TileView/TileView');
import Env = require('Env/Env');
import defaultItemTpl = require('wml!Controls/_tile/TreeTileView/DefaultItemTpl');

var TreeTileView = TileView.extend({
    _defaultItemTemplate: defaultItemTpl,
    _beforeUpdate: function (newOptions) {
        if (this._options.nodesHeight !== newOptions.nodesHeight) {
            this._listModel.setNodesHeight(newOptions.nodesHeight);
        }
        if (this._options.tileSize !== newOptions.tileSize) {
            this._listModel.setTileSize(newOptions.tileSize);
        }
        TreeTileView.superclass._beforeUpdate.apply(this, arguments);
    },
    _onTileViewKeyDown: function (event) {
        // Pressing the left or right key allows you to expand / collapse an element.
        // In tileView mode, expand/collapse is not allowed.
        if (event.nativeEvent.keyCode === Env.constants.key.right || event.nativeEvent.keyCode === Env.constants.key.left) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }
});

TreeTileView._theme = ['Controls/tile'];

export = TreeTileView;
