export function getPanelData() {
    return [{
        id: 'print',
        '@parent': false,
        icon: 'icon-Print icon-medium',
        title: 'Распечатать',
        actionName: 'Controls-demo/Browser/WithOperationPanel/Action',
        actionOptions: {
            name: 'Печать'
        },
        parent: null
    }, {
        id: 'save',
        '@parent': true,
        icon: 'icon-Save',
        title: 'Выгрузить',
        actionName: 'Controls-demo/Browser/WithOperationPanel/Action',
        actionOptions: {
            name: 'Выгрузка'
        },
        parent: null
    }, {
        id: 'PDF',
        '@parent': false,
        title: 'PDF',
        actionName: 'Controls-demo/Browser/WithOperationPanel/Action',
        actionOptions: {
            name: 'PDF'
        },
        parent: 'save'
    }, {
        id: 'Excel',
        '@parent': false,
        title: 'Excel',
        actionName: 'Controls-demo/Browser/WithOperationPanel/Action',
        actionOptions: {
            name: 'Excel'
        },
        parent: 'save'
    }, {
        id: 'plainList',
        '@parent': false,
        icon: 'icon-ListView',
        title: 'Развернуть без подразделений',
        actionName: 'Controls-demo/Browser/WithOperationPanel/Action',
        actionOptions: {
            name: 'Разворот без разделов'
        },
        parent: null
    }];
}

export function getAddedData() {
    return [
        {
            id: 'sum',
            '@parent': false,
            icon: 'icon-Sum',
            iconStyle: 'label',
            title: 'Суммировать',
            actionName: 'Controls-demo/Browser/WithOperationPanel/Action',
            actionOptions: {
                name: 'Суммирование'
            },
            parent: null
        }, {
            actionName: 'Controls/actions:Remove'
        }, {
            actionName: 'Controls/actions:Move',
            commandOptions: {
                columns: [{
                    displayProperty: 'department'
                }]
            }

        }
    ];
}
