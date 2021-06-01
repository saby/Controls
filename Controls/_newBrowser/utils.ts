import {RecordSet} from 'Types/collection';
import {IBrowserViewConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';

/**
 * Из метаданных RecordSet возвращает конфигурацию отображения списка
 * в detail-колонке
 */
export function getListConfiguration(items: RecordSet): IBrowserViewConfig {
    const meta = items.getMetaData();
    return meta.listConfiguration || meta.results?.get('ConfigurationTemplate');
}
