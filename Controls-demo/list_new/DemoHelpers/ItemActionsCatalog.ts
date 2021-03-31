import { IItemAction, TActionDisplayMode, TItemActionShowType } from 'Controls/itemActions';

function getActionsForContacts(): IItemAction[] {
    return [
        {
            id: 1,
            title: 'Прочитано',
            showType: TItemActionShowType.TOOLBAR
        },
        {
            id: 2,
            icon: 'icon-PhoneNull',
            title: 'Позвонить',
            showType: TItemActionShowType.MENU_TOOLBAR
        },
        {
            id: 3,
            icon: 'icon-EmptyMessage',
            title: 'Написать',
            'parent@': true,
            showType: TItemActionShowType.TOOLBAR
        },
        {
            id: 4,
            icon: 'icon-Chat',
            title: 'Диалог',
            showType: TItemActionShowType.MENU_TOOLBAR,
            parent: 3
        },
        {
            id: 5,
            icon: 'icon-Email',
            title: 'Email',
            showType: TItemActionShowType.MENU,
            parent: 3
        },
        {
            id: 6,
            icon: 'icon-Profile',
            title: 'Профиль пользователя',
            showType: TItemActionShowType.MENU
        },
        {
            id: 7,
            title: 'Удалить',
            showType: TItemActionShowType.MENU,
            icon: 'icon-Erase',
            iconStyle: 'danger'
        }
    ];
}
function getActionsWithDisplayMode(): IItemAction[] {
    return [
        {
            id: 1,
            icon: 'icon-Email',
            title: 'Email',
            displayMode: TActionDisplayMode.BOTH,
            tooltip: 'Электронная почта',
            showType: TItemActionShowType.TOOLBAR
        },
        {
            id: 2,
            icon: 'icon-Profile',
            title: 'Профиль пользователя',
            displayMode: TActionDisplayMode.TITLE,
            showType: TItemActionShowType.TOOLBAR
        },
        {
            id: 3,
            title: 'Удалить',
            showType: TItemActionShowType.TOOLBAR,
            displayMode: TActionDisplayMode.ICON,
            icon: 'icon-Erase',
            iconStyle: 'danger'
        }];
}

function getMoreActions(): Array<{
    id: number
    title: string
    showType?: number
    icon?: string
    iconStyle?: string
    handler?: Function
    parent?: number
    'parent@'?: true | false
}> {
    return [
        {
            id: 10,
            icon: 'icon-Erase icon-error',
            title: 'delete pls',
            showType: TItemActionShowType.TOOLBAR,
            // tslint:disable-next-line
            handler: () => { console.log('click to error-icon') }
        },
        {
            id: 12,
            icon: 'icon-View icon-small',
            title: 'view',
            showType: TItemActionShowType.TOOLBAR,
            // tslint:disable-next-line
            handler: () => { console.log('click to View-icon') }
        },
        {
            id: 13,
            icon: 'icon-Motion icon-small',
            title: 'motion',
            showType: TItemActionShowType.TOOLBAR,
            // tslint:disable-next-line
            handler: () => { console.log('click to Motion-icon') }
        }
    ];
}

export {
    getActionsForContacts,
    getActionsWithDisplayMode,
    getMoreActions
};
