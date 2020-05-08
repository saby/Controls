import 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoDeviceList';
import 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoDateList';
import 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoLocationList';
import 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoIconsList';
import {showType} from 'Controls/Utils/Toolbar';

function getColumns() {
    return [
        {
            template: 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoDeviceList',
            width: '1fr'
        }, {
            template: 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoDateList',
            width: '75px'
        }, {
            template: 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoLocationList',
            width: '140px'
        }, {
            template: 'wml!Controls-demo/DevicesInfo/columnTemplates/DevicesInfoIconsList',
            width: '90px'
        }
    ];
}

function getActionsForDevices() {
    return [
        {
            id: 0,
            icon: 'icon-OutHotel',
            title: 'Завершить сеанс',
            showType: showType.MENU
        },
        {
            id: 1,
            title: 'Заблокировать',
            showType: showType.MENU,
            icon: 'icon-Lock',
            iconStyle: 'danger'
        }, {
            id: 2,
            title: 'Статус устройства',
            'parent@': true,
            showType: showType.MENU,
            parent : null
        }, {
            id: 3,
            title: 'Рабочий компьютер',
            icon: 'icon-TFComputer',
            showType: showType.MENU,
            parent: 2
        }, {
            id: 4,
            title: 'Домашнее устройство',
            icon: 'icon-Home',
            showType: showType.MENU,
            parent: 2
        }, {
            id: 5,
            title: 'Мобильное устройство',
            icon: 'icon-PhoneCell',
            showType: showType.MENU,
            parent: 2
        }, {
            id: 6,
            title: 'Не определено',
            icon: 'icon-QuestionNew',
            showType: showType.MENU,
            parent: 2
        }
    ];
}

function getActionsForBlockedDevices() {
    return [
        {
            id: 0,
            icon: 'icon-Unlock',
            title: 'Разблокировать',
            showType: showType.TOOLBAR
        }
    ];
}

function getActionsForFailedTries() {
    return [
        {
            id: 0,
            icon: 'icon-Lock',
            title: 'Заблокировать',
            showType: showType.TOOLBAR,
            iconStyle: 'danger'
        }
    ];
}

export {
    getActionsForFailedTries,
    getActionsForBlockedDevices,
    getActionsForDevices,
    getColumns
}
