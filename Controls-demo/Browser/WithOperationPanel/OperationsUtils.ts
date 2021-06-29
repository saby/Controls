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
    }, {
        id: 'sum',
        '@parent': false,
        icon: 'icon-Sum',
        title: 'Суммировать',
        actionName: 'Controls-demo/Browser/WithOperationPanel/Action',
        actionOptions: {
            name: 'Суммирование'
        },
        parent: null
    }, {
        actionName: 'Controls/defaultActions:Remove'
    }, {
        title: 'Sync del',
        actionName: 'Controls/defaultActions:Remove',
        commandOptions: {
            providerName: 'Controls/listActions:RemoveProvider'
        },
        viewCommandName: 'Controls/viewCommands:AtomicRemove'
    }, {
        actionName: 'Controls/defaultActions:Move',
        commandOptions: {
            columns: [{
                displayProperty: 'department'
            }]
        }

    }];
}
