import {RecordSet} from 'Types/collection';
import {IBrowserViewConfig, ImageGradient, ImageViewMode} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';

/**
 * Из метаданных RecordSet возвращает конфигурацию отображения списка
 * в detail-колонке
 */
export function getListConfiguration(items: RecordSet): IBrowserViewConfig {
    const meta = items.getMetaData();
    return meta.listConfiguration || meta.results?.get('ConfigurationTemplate');
}

/**
 * На основании переданных опиций собирает полный набор ISourceOptions для master- или detail-колонки
 */
export function compileSourceOptions(options: IOptions, forDetail: boolean): ISourceOptions {
    const specific = forDetail ? options.detail : options.master;

    return {
        root: specific.root || (!forDetail ? options.masterRoot : null) || options.root,
        filter: specific.filter || options.filter,
        source: specific.source || options.source,
        columns: specific.columns || options.columns,
        keyProperty: specific.keyProperty || options.keyProperty,
        nodeProperty: specific.nodeProperty || options.nodeProperty,
        parentProperty: specific.parentProperty || options.parentProperty,
        displayProperty: specific.displayProperty || options.displayProperty,
        hasChildrenProperty: specific.hasChildrenProperty || options.hasChildrenProperty
    };
}

export class TileConfig {
    get imagePosition(): string {
        return this.cfg.tile.tile.imagePosition;
    }

    get imageSize(): string {
        return this.cfg.tile.tile.size;
    }

    constructor(
        private cfg: IBrowserViewConfig,
        private browserOptions: IOptions
    ) {}

    getDescription(itemData: any): string {
        return itemData.item.get(this.browserOptions.detail.descriptionProperty);
    }

    getDescriptionLines(itemData: any): string | number {
        const cfg = itemData.dispItem.isNode() ? this.cfg.tile.node : this.cfg.tile.leaf;
        return cfg.descriptionLines;
    }

    /**
     * Возвразщает цвет градиента плитки на основании типа узла и данных узла
     */
    getGradientColor(itemData: any): string {
        const imageGradient = itemData.dispItem.isNode()
            ? this.cfg.tile.node.imageGradient
            : this.cfg.tile.leaf.imageGradient;

        if (imageGradient === ImageGradient.none) {
            return null;
        }

        if (imageGradient === ImageGradient.light) {
            return '#fff';
        }

        // В режима ImageGradient.custom берем значение из поля записи
        return itemData.item.get(this.browserOptions.detail.gradientColorProperty);
    }

    getImageEffect(itemData: any): string {
        const imageGradient = itemData.dispItem.isNode()
            ? this.cfg.tile.node.imageGradient
            : this.cfg.tile.leaf.imageGradient;

        // В данное точке нет различия между ImageEffect.smart и ImageEffect.mono
        // Различия появляются при расчете цвета градиента
        if (imageGradient === ImageGradient.custom || imageGradient === ImageGradient.light) {
            return 'gradient';
        }

        return null;
    }

    getImageViewMode(itemData: any): string {
        return  itemData.dispItem.isNode()
            ? this.cfg.tile.node.imageViewMode
            : this.cfg.tile.leaf.imageViewMode;
    }
}

export class ListConfig {
    get imagePosition(): string {
        return this.cfg.list.list.imagePosition;
    }

    get imageProperty(): string {
        return this.browserOptions.detail.imageProperty;
    }

    get imageViewMode(): string {
        return ImageViewMode.rectangle;
    }

    constructor(
        private cfg: IBrowserViewConfig,
        private browserOptions: IOptions
    ) {}
}
