import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';

export function items(items: RecordSet<Record>): RecordSet<Record> {
    items.each((item) => {
        const iconValue = item.get('icon');
        const iconStyleValue = item.get('iconStyle')|| 'secondary';
        const viewModeValue = item.get('viewMode');
        let captionValue = '';
        const readOnlyValue = item.get('readOnly');

        if (viewModeValue && viewModeValue !== 'toolButton') {
            captionValue = item.get('caption');
        } else if (item.get('title') && !viewModeValue) {
            captionValue = item.get('title');
        }

        item.set('icon', iconValue);
        item.set('iconStyle', iconStyleValue);
        item.set('viewMode', viewModeValue || 'link');
        item.set('caption', captionValue);
        item.set('readOnly', readOnlyValue);

        if (iconValue && iconValue.split(' ').length === 1) {
            item.set('iconSize', 'm');
        }
    });

    return items;
}
