import { groupConstants } from 'Controls/list';

export interface ITestDataItem {
    key: number;
    caption: string;
    group?: string;
}

const TEST_GROUP_SIZE = 3;

export function generateFlatSimpleColumns() {
    return [{
        displayProperty: 'key'
    }, {
        displayProperty: 'caption'
    }];
}

export function generateFlatSimpleHeader() {
    return [{
        caption: 'key'
    }, {
        caption: 'caption'
    }];
}

export function generateFlatData(count: number, splitIntoGroups: boolean): ITestDataItem[] {
    const result: ITestDataItem[] = [];
    for (let idx = 1; idx <= count; idx++) {
        const item: ITestDataItem = { key: idx, caption: 'item_' + idx };
        if (splitIntoGroups) {
            const groupIdx = idx % TEST_GROUP_SIZE;
            item.group = groupIdx ? 'group_' + groupIdx : groupConstants.hiddenGroup;
        }
        result.push(item);
    }
    return result;
}
