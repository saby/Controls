import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');


enum ResultsPosition {
    Top = 'top',
    Bottom = 'bottom'
}

function calcRowIndexByKey(
    key: string|number,
    display,
    hasHeader: boolean = false,
    resultsPosition: ResultsPosition|null = null,
    hierarchyRelation?,
    hasMoreStorage?,
    hasFooterTemplate = false,
    expandedItems = {}
): number {

    let
        rowTopOffset: number = calcTopOffset(hasHeader, resultsPosition),
        keyProperty: string = display.getCollection().getIdProperty(),
        item = ItemsUtil.getDisplayItemById(display, key, keyProperty),
        itemIndex: number = display.getIndexBySourceItem(item.getContents());

    if (!hierarchyRelation || !hasMoreStorage) {
        return rowTopOffset + itemIndex;
    }

    return rowTopOffset + itemIndex + _calcHasMoreButtonsBefore(itemIndex, display, hierarchyRelation, hasMoreStorage, hasFooterTemplate, expandedItems);
}

function calcFooterRowIndex(
    display,
    hasResults: boolean = false,
    hasHeader: boolean = false,
    hasEmptyTemplate: boolean = false,
    hierarchyRelation?,
    hasMoreStorage?
): number {
    return calcResultsRowIndex(display, ResultsPosition.Bottom, hasHeader, hasEmptyTemplate, hierarchyRelation, hasMoreStorage) + (hasResults ? 1 : 0);
}

function calcResultsRowIndex(
    display,
    resultsPosition: ResultsPosition|null = null,
    hasHeader: boolean = false,
    hasEmptyTemplate: boolean = false,
    hierarchyRelation?,
    hasMoreStorage?
): number {

    if (resultsPosition === ResultsPosition.Top || display.getCollectionCount() === 0) {
        return hasHeader ? 1 : 0;
    }


    let
        lastItem = ItemsUtil.getLastItem(display),
        lastItemId: string,
        lastRowIndex: number;

    /*
    * If ItemsUtil gives undefined as last item, it means that there are no displayed records in list,
    * but groups may be displayed and collapsed. So as last item should take last group.
    * */
    if (lastItem) {
        lastItemId = lastItem.getId();
        lastRowIndex = calcRowIndexByKey(lastItemId, display, hasHeader, resultsPosition, hierarchyRelation, hasMoreStorage);
    } else {
        lastItem = display.at(display.getCount() - 1);
        lastRowIndex = calcRowIndexByItem(lastItem, display, hasHeader, resultsPosition, hierarchyRelation);
    }

    // If after last item exists node footer
    if (hierarchyRelation && hasMoreStorage) {
        if (hasMoreStorage[lastItemId]){
            lastRowIndex++;
        }
    }

    return lastRowIndex + 1;
}

function calcRowIndexByItem(item, display, hasHeader, resultsPosition, hierarchyRelation?, hasMoreStorage?, hasFooterTemplate = false, expandedItems = {}): number {
    let index = display.getIndex(item);
    return _calcRowIndexByDisplayIndex(index, display, hasHeader, resultsPosition, hierarchyRelation, hasMoreStorage, hasFooterTemplate, expandedItems);
}

function calcTopOffset(
    hasHeader: boolean = false,
    resultsPosition?: ResultsPosition|null,
): number {

    let offset = 0;

    if (hasHeader) {
        offset++;
    }

    if(resultsPosition && resultsPosition === ResultsPosition.Top) {
        offset++;
    }

    return offset;
}

function _calcRowIndexByDisplayIndex(
    index: number,
    display,
    hasHeader: boolean = false,
    resultsPosition: ResultsPosition|null = null,
    hierarchyRelation?,
    hasMoreStorage?,
    hasFooterTemplate: boolean = false,
    expandedItems = {}
): number {
    let rowTopOffset: number = calcTopOffset(hasHeader, resultsPosition);

    if (!hasMoreStorage || !hierarchyRelation) {
        return index + rowTopOffset;
    }

    return rowTopOffset + index + _calcHasMoreButtonsBefore(index, display, hierarchyRelation, hasMoreStorage, hasFooterTemplate, expandedItems);
}

function _calcHasMoreButtonsBefore(itemIndex: number, display, hierarchyRelation, hasMoreStorage, hasFooterTemplate, expandedItems = {}): number {
    let
        count = 0,
        keyProperty: string = display.getCollection().getIdProperty();

    if (hierarchyRelation && hasFooterTemplate) {
        for (let i = 0; i < itemIndex; i++) {
            let item = display.at(1).getContents();
            if (item.get && hierarchyRelation.isNode(item) && expandedItems[item.getId()]) {
                count++;
            }
        }
    }

    for (let key in hasMoreStorage) {
        if (hasMoreStorage[key] === true) {
            let
                item = ItemsUtil.getDisplayItemById(display, key, keyProperty),
                childsCount = hierarchyRelation.getChildren(key, display.getCollection()).length;

            if (itemIndex > display.getIndex(item) + childsCount) {
                count++;
            }
        }
    }
    return count;
}

export {
    ResultsPosition,
    calcRowIndexByKey,
    calcResultsRowIndex,
    calcRowIndexByItem,
    calcTopOffset,
    calcFooterRowIndex
}



