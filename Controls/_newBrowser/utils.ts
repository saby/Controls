import {RecordSet} from 'Types/collection';
import {IDetailOptions, IMasterOptions, IOptions} from 'Controls/newBrowser';
import {IExplorerOptions} from 'Controls/_newBrowser/interfaces/IExplorerOptions';
import {IBrowserViewConfig, ImageGradient} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {Model} from 'Types/entity';

/**
 * Из метаданных RecordSet возвращает конфигурацию отображения списка
 * в detail-колонке
 */
export function getListConfiguration(items: RecordSet): IBrowserViewConfig {
    const meta = items.getMetaData();
    return meta.listConfiguration || meta.results?.get('ConfigurationTemplate');
}

export function buildDetailOptions(options: IOptions): IExplorerOptions {
    const detail = options.detail as IDetailOptions;

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

        root: options.masterRoot === undefined ? options.root : options.masterRoot,

        source: master.source || options.source,
        keyProperty: master.keyProperty || options.keyProperty,
        nodeProperty: master.nodeProperty || options.nodeProperty,
        parentProperty: master.parentProperty || options.parentProperty,
        displayProperty: master.displayProperty || options.displayProperty,
        hasChildrenProperty: master.hasChildrenProperty || options.hasChildrenProperty
    };
}
