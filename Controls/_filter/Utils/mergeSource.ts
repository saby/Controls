import {factory} from 'Types/chain';
import {object} from 'Types/util';
import isEqualItems from 'Controls/_filter/Utils/isEqualItems';

export default function mergeSource<T, U>(target: T, source: T): T & U {
    factory(target).each((item) => {
        factory(source).each((historyItem) => {
            if (isEqualItems(item, historyItem)) {
                factory(historyItem).each((value, field: string) => {
                    const allowMerge = field === 'viewMode' ? value !== undefined : historyItem.hasOwnProperty(field);

                    if (item.hasOwnProperty(field) && allowMerge) {
                        object.setPropertyValue(item, field, value);
                    }
                });
            }
        });
    });

    return target;
}
