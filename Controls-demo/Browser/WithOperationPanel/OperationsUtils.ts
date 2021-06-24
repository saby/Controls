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
        id: 'remove',
        '@parent': false,
        icon: 'icon-Erase',
        title: 'Удалить',
        actionName: 'Controls/listActions:Remove',
        viewActionName: 'Controls/viewCommands:Remove',
        parent: null
    }, {
        id: 'atomicRemove',
        '@parent': false,
        icon: 'icon-Erase',
        title: 'Удалить синхронно',
        actionName: 'Controls/listActions:Remove',
        actionOptions: {
            providerName: 'Controls/listActions:RemoveProvider'
        },
        viewActionName: 'Controls/viewCommands:AtomicRemove',
        parent: null
    }, {
        id: 'Move',
        '@parent': false,
        icon: 'icon-Move',
        title: 'Переместить с перезагрузкой списка',
        actionName: 'Controls/listActions:Move',
        actionOptions: {
            columns: [{
                displayProperty: 'department'
            }],
            filter: {onlyFolders: true}
        },
        viewActionName: 'Controls/viewCommands:Reload',
        parent: null
    }
    ];
}
