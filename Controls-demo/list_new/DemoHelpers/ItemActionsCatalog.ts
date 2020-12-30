import { showType } from 'Controls/toolbars';
import { IItemAction, TActionDisplayMode } from 'Controls/itemActions';

function getActionsForContacts(): IItemAction[] {
    return [
        {
            id: 1,
            title: 'Прочитано',
            showType: showType.TOOLBAR
        },
        {
            id: 2,
            icon: 'icon-PhoneNull',
            title: 'Позвонить',
            showType: showType.MENU_TOOLBAR
        },
        {
            id: 3,
            icon: 'icon-EmptyMessage',
            title: 'Написать',
            'parent@': true,
            showType: showType.TOOLBAR
        },
        {
            id: 4,
            icon: 'icon-Chat',
            title: 'Диалог',
            showType: showType.MENU_TOOLBAR,
            parent: 3
        },
        {
            id: 5,
            icon: 'icon-Email',
            title: 'Email',
            showType: showType.MENU,
            parent: 3
        },
        {
            id: 6,
            icon: 'icon-Profile',
            title: 'Профиль пользователя',
            showType: showType.MENU
        },
        {
            id: 7,
            title: 'Удалить',
            showType: showType.MENU,
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
            showType: showType.TOOLBAR
        },
        {
            id: 2,
            icon: 'icon-Profile',
            title: 'Профиль пользователя',
            displayMode: TActionDisplayMode.TITLE,
            showType: showType.TOOLBAR
        },
        {
            id: 3,
            title: 'Удалить',
            showType: showType.TOOLBAR,
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
            showType: showType.TOOLBAR,
            // tslint:disable-next-line
            handler: () => { console.log('click to error-icon') }
        },
        {
            id: 12,
            icon: 'icon-View icon-small',
            title: 'view',
            showType: showType.TOOLBAR,
            // tslint:disable-next-line
            handler: () => { console.log('click to View-icon') }
        },
        {
            id: 13,
            icon: 'icon-Motion icon-small',
            title: 'motion',
            showType: showType.TOOLBAR,
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
