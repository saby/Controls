import TileView = require('Controls/_tileOld/TileView/TileView');
import Env = require('Env/Env');
import {isEqual} from 'Types/object';
import defaultItemTpl = require('wml!Controls/_tileOld/TreeTileView/DefaultItemTpl');
import 'css!Controls/tile';

var TreeTileView = TileView.extend({
    _defaultItemTemplate: defaultItemTpl,
    _beforeUpdate: function (newOptions) {
        if (this._options.nodesHeight !== newOptions.nodesHeight) {
            this._listModel.setNodesHeight(newOptions.nodesHeight);
        }
        if (this._options.tileSize !== newOptions.tileSize) {
            this._listModel.setTileSize(newOptions.tileSize);
        }

        if (!isEqual(this._options.roundBorder, newOptions.roundBorder)) {
            this._listModel.setRoundBorder(newOptions.roundBorder);
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

export = TreeTileView;
