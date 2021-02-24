import {RecordSet} from 'Types/collection';
import {IMasterOptions, IOptions} from 'Controls/newBrowser';
import {IExplorerOptions} from 'Controls/_newBrowser/interfaces/IExplorerOptions';
import {IBrowserViewConfig, ImageGradient, ImageViewMode} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';

/**
 * Из метаданных RecordSet возвращает конфигурацию отображения списка
 * в detail-колонке
 */
export function getListConfiguration(items: RecordSet): IBrowserViewConfig {
    const meta = items.getMetaData();
    return meta.listConfiguration || meta.results?.get('ConfigurationTemplate');
}

export function buildDetailOptions(options: IOptions): IExplorerOptions {
    const detail = options.detail;

    return {
        ...detail,

        root: options.root,
        filter: options.filter,
        searchValue: options.searchValue,

        source: detail.source || options.source,
        keyProperty: detail.keyProperty || options.keyProperty,
        nodeProperty: detail.nodeProperty || options.nodeProperty,
        parentProperty: detail.parentProperty || options.parentProperty,
        displayProperty: detail.displayProperty || options.displayProperty,
        hasChildrenProperty: detail.hasChildrenProperty || options.hasChildrenProperty
    };
}

export function buildMasterOptions(options: IOptions): IExplorerOptions {
    const master = options.master as IMasterOptions;

    return {
        ...options.master,

        root: options.masterRoot || options.root,

        source: master.source || options.source,
        keyProperty: master.keyProperty || options.keyProperty,
        nodeProperty: master.nodeProperty || options.nodeProperty,
        parentProperty: master.parentProperty || options.parentProperty,
        displayProperty: master.displayProperty || options.displayProperty,
        hasChildrenProperty: master.hasChildrenProperty || options.hasChildrenProperty
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
