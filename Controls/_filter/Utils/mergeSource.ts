import {object} from 'Types/util';
import isEqualItems from 'Controls/_filter/Utils/isEqualItems';
import {IFilterItem} from 'Controls/filter';

export default function mergeSource(target: IFilterItem[] = [], source: IFilterItem[] = []): IFilterItem[] {
    target.forEach((item) => {
        source.forEach((historyItem) => {
            if (isEqualItems(item, historyItem)) {
                for (const fieldName in historyItem) {
                    const value = historyItem[fieldName];
                    const allowMerge = fieldName === 'viewMode' ?
                        value !== undefined :
                        historyItem.hasOwnProperty(fieldName);

                    if ((item.hasOwnProperty(fieldName) || fieldName === 'displayTextValue') && allowMerge) {
                        if (fieldName === 'displayTextValue') {
                            item[fieldName] = value;
                        } else {
                            object.setPropertyValue(item, fieldName, value);
                        }
                    }
                }
            }
        });
    });

    return target;
}
