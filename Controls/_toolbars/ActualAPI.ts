import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';

export function items(items: RecordSet<Record>): RecordSet<Record> {
    items.each((item) => {
        const iconSize = item.get('iconSize');
        const viewModeValue = item.get('viewMode');
        let captionValue = '';

        if (viewModeValue && viewModeValue !== 'toolButton') {
            captionValue = item.get('caption');
        } else if (item.get('title') && !viewModeValue) {
            captionValue = item.get('title');
        }

        item.set('viewMode', viewModeValue || 'link');
        item.set('caption', captionValue);
        item.set('iconSize', iconSize || 'm');
    });

    return items;
}
