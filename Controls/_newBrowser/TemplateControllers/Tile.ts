import {default as BaseController, ITemplateControllerOptions} from './Base';
import {ImageGradient, ITileConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {TreeItem} from 'Controls/display';

export default class TileController extends BaseController<ITileConfig, TreeItem> {
    constructor(options: ITemplateControllerOptions) {
        super(options);
    }

    protected _getViewModeConfig(): ITileConfig {
        return this._$listConfiguration.tile;
    }

    get imagePosition(): string {
        return this._viewModeConfig.tile.imagePosition;
    }

    get tileSize(): string {
        return this._viewModeConfig.tile.size;
    }

    getGradientColor(item: TreeItem): string {
        const imageGradient = this._isNode(item)
            ? this._viewModeConfig.node.imageGradient
            : this._viewModeConfig.leaf.imageGradient;

        if (imageGradient === ImageGradient.none) {
            return null;
        }

        if (imageGradient === ImageGradient.light) {
            return '#fff';
        }

        // В режима ImageGradient.custom берем значение из поля записи
        return item.contents.get(this._$browserOptions.detail.gradientColorProperty);
    }

    getImageEffect(item: TreeItem): string {
        const imageGradient = this._isNode(item)
            ? this._viewModeConfig.node.imageGradient
            : this._viewModeConfig.leaf.imageGradient;

        // В данное точке нет различия между ImageEffect.smart и ImageEffect.mono
        // Различия появляются при расчете цвета градиента
        if (imageGradient === ImageGradient.custom || imageGradient === ImageGradient.light) {
            return 'gradient';
        }

        return null;
    }

    getImageViewMode(item: TreeItem): string {
        if (this.getImageVisibility() === 'hidden') {
            return 'none';
        } else {
            return this._isNode(item)
                ? this._viewModeConfig.node.imageViewMode
                : this._viewModeConfig.leaf.imageViewMode;
        }
    }

    getImageProportion(item: TreeItem): string {
        return this._isNode(item)
            ? this._viewModeConfig.node.imageProportion
            : this._viewModeConfig.leaf.imageProportion;
    }
}
