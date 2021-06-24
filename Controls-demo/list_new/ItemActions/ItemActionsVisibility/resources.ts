import { IoC } from 'Env/Env';
import {Model} from 'Types/entity';

import { IItemAction, TItemActionShowType } from 'Controls/itemActions';

export interface ISrcData {
    id: number;
    title: string;
    description: string;
}

export const columns = [
    {
        displayProperty: 'id'
    },
    {
        displayProperty: 'title'
    },
    {
        displayProperty: 'description'
    }
];

export const srcData: ISrcData[] = [
    {
        id: 1,
        title: 'Notebooks 1',
        description: 'Другое название 1'
    },
    {
        id: 2,
        title: 'Notebooks 2',
        description: 'Описание вот такое'
    },
    {
        id: 3,
        title: 'Smartphones 3 ',
        description: 'Хватит страдать'
    },
    {
        id: 4,
        title: 'Notebooks 1',
        description: 'Другое название 1'
    },
    {
        id: 5,
        title: 'Notebooks 2',
        description: 'Описание вот такое'
    },
    {
        id: 6,
        title: 'Smartphones 3 ',
        description: 'Хватит страдать'
    }
];

export const menuItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        handler(model: Model): void {
            IoC.resolve('ILogger').info('action phone Click ', model);
        }
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        parent: null,
        'parent@': true,
        handler(model: Model): void {
            alert('Message Click');
        }
    },
    {
        id: 3,
        icon: 'icon-Profile',
        title: 'profile',
        showType: TItemActionShowType.MENU,
        parent: 2,
        'parent@': null,
        handler(model: Model): void {
            IoC.resolve('ILogger').info('action profile Click');
        }
    },
    {
        id: 6,
        title: 'call',
        parent: 2,
        'parent@': null,
        handler(model: Model): void {
            IoC.resolve('ILogger').info('action profile Click');
        }
    }
];

export const menuToolbarItemActions: IItemAction[] = [
    {
        id: 5,
        title: 'прочитано',
        showType: TItemActionShowType.TOOLBAR,
        handler(model: Model): void {
            IoC.resolve('ILogger').info('action read Click');
        }
    },
    ...menuItemActions,
    {
        id: 4,
        icon: 'icon-Erase',
        iconStyle: 'danger',
        title: 'delete pls',
        showType: TItemActionShowType.TOOLBAR,
        handler(model: Model): void {
            IoC.resolve('ILogger').info('action delete Click');
        }
    }
];
