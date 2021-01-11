import {RecordSet} from 'Types/collection';
import {IListConfiguration, ImageEffect} from 'Controls/_newBrowser/interfaces/IListConfiguration';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';

/**
 * Из метаданных RecordSet возвращает конфигурацию отображения списка
 * в detail-колонке
 */
export function getListConfiguration(items: RecordSet): IListConfiguration {
    // return items.getMetaData().listConfiguration;
    return items.getMetaData().results.get('ConfigurationTemplate');
}

/**
 * На основании переданных опиций собирает полный набор ISourceOptions для master- или detail-колонки
 */
export function compileSourceOptions(options: IOptions, forDetail: boolean): ISourceOptions {
    const specific = forDetail ? options.detail : options.master;

    return {
        root: specific.root || options.root,
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
        private cfg: IListConfiguration,
        private browserOptions: IOptions
    ) {}

    getDescription(itemData: any): string {
        return itemData.item.get(this.browserOptions.detail.descriptionProperty);
    }

    getDescriptionLines(itemData: any): string | number {
        const cfg = itemData.dispItem.isNode() ? this.cfg.tile.node : this.cfg.tile.leaf;
        return cfg.countLines;
    }

    /**
     * Возвразщает цвет градиента плитки на основании типа узла и данных узла
     */
    getGradientColor(itemData: any): string {
        const photo = itemData.dispItem.isNode() ? this.cfg.tile.photoNode : this.cfg.tile.photoLeaf;

        if (photo.effect === ImageEffect.default) {
            return null;
        }

        if (photo.effect === ImageEffect.mono) {
            return '#fff';
        }

        // В режима ImageEffect.smart берем значение из поля записи
        return itemData.item.get(this.browserOptions.detail.gradientColorProperty);
    }

    getImageEffect(itemData: any): string {
        const photo = itemData.dispItem.isNode() ? this.cfg.tile.photoNode : this.cfg.tile.photoLeaf;

        // В данное точке нет различия между ImageEffect.smart и ImageEffect.mono
        // Различия появляются при расчете цвета градиента
        if (photo.effect === ImageEffect.smart || photo.effect === ImageEffect.mono) {
            return 'gradient';
        }

        return null;
    }

    getImageViewMode(itemData: any): string {
        const photo = itemData.dispItem.isNode() ? this.cfg.tile.photoNode : this.cfg.tile.photoLeaf;
        return photo.viewMode;
    }
}
