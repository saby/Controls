import chain = require('Types/chain');
import collection = require('Types/collection');
import Utils = require('Types/util');

/* мапинг новой структуры в старую*/
const recordToSructureElemMap = {
    id: 'internalValueField',
    caption: 'internalCaptionField',
    value: 'value',
    resetValue: 'resetValue',
    textValue: 'caption',
    visibility: 'visibilityValue'
};

/* Мапинг старой стрктуры в новую */
const structureMap = {};
for (const i in recordToSructureElemMap) {
    if (recordToSructureElemMap.hasOwnProperty(i)) {
        structureMap[recordToSructureElemMap[i]] = i;
    }
}

function convertToFilterStructure(items) {
    return chain.factory(items).map((item) => {
        const itemStructureItem = {};
        for (const i in structureMap) {
            if (Utils.object.getPropertyValue(item, structureMap[i]) !== undefined && structureMap.hasOwnProperty(i)) {
                itemStructureItem[i] = Utils.object.getPropertyValue(item, structureMap[i]);
            }
        }
        return itemStructureItem;
    }).value();
}

function convertToSourceDataArray(filterStructure, visibilitiesObject?) {
    const dataArray = [];
    chain.factory(filterStructure).each(function (item) {
        const rsItem = {};
        for (const i in recordToSructureElemMap) {
            if (Utils.object.getPropertyValue(item, recordToSructureElemMap[i]) !== undefined && recordToSructureElemMap.hasOwnProperty(i)) {
                if (i === 'visibility' && visibilitiesObject && !visibilitiesObject.hasOwnProperty(item.internalValueField)) {
                    continue;
                }
                rsItem[i] = Utils.object.getPropertyValue(item, recordToSructureElemMap[i]);
            }
        }
        dataArray.push(rsItem);
    });
    return dataArray;
}

function convertToSourceData(filterStructure) {
    const dataArray = convertToSourceDataArray(filterStructure);

    return new collection.RecordSet({
        rawData: dataArray
    });
}

export = {
    convertToFilterStructure,
    convertToSourceData,
    convertToSourceDataArray
};
