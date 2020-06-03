const data = [
    {
        key: 'level_null_item_1',
        parent: null,
        type: true
    }, {
        key: 'level_1_item_1',
        parent: 'level_null_item_1',
        type: true
    }, {
        key: 'level_1_item_2',
        parent: 'level_null_item_1',
        type: null
    }, {
        key: 'level_2_item_1',
        parent: 'level_1_item_1',
        type: null
    }, {
        key: 'level_2_item_2',
        parent: 'level_1_item_1',
        type: null
    },
    {
        key: 'level_null_item_2',
        parent: null,
        type: true
    }, {
        key: 'level_1_item_1',
        parent: 'level_null_item_2',
        type: true
    }
];

const columns = [{
    width: '1fr',
    displayProperty: 'key'
}];

export {
    data,
    columns
};
