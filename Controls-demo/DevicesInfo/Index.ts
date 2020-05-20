import {Control, TemplateFunction} from 'UI/Base';
import {Memory, SbisService, ICrud, Query} from 'Types/source';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {adapter} from 'Types/entity';
import {RecordSet} from 'Types/collection';

import RecordSynchronizer = require('Controls/Utils/RecordSynchronizer');
import {
    getActionsForDevices,
    getColumns,
    getActionsForBlockedDevices,
    getActionsForFailedTries
} from 'Controls-demo/DevicesInfo/DevicesInfoTools';
import {failingAuth, mainRecord} from 'Controls-demo/DevicesInfo/DemoData';

import * as Template from 'wml!Controls-demo/DevicesInfo/DevicesInfo';

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

type TItems = RecordSet<Record>;

const MIN_PAGE_SIZE: number = 3;
const MAX_PAGE_SIZE: number = 50;

enum actionType {
    clearSession = 0,
    lockDevice = 1
}

enum deviceType {
    computer = 3,
    home = 4,
    phone = 5,
    notDefined = 6
}

export default class extends Control {
    protected _template: TemplateFunction = Template;

    private _blockedDevicesArrowExpanded: boolean = false;
    private _activityDevicesArrowExpanded: boolean = false;
    private _blockedDevicesArrowVisible: boolean = false;
    private _activityDevicesArrowVisible: boolean = false;
    private _blockedDevicesVisible: boolean = true;
    private _failingAuthVisible: boolean = true;
    private _activityDevicesRecordSet: RecordSet;
    private _blockedDevicesRecordSet: RecordSet;
    private _failingAuthRecordSet: RecordSet;

    protected _viewSourceDevices: Memory;
    protected _viewSourceBlockedDevices: Memory;
    protected _viewSourceFailedTries: Memory;

    protected _devicesNavigation: INavigationOptionValue<INavigationSourceConfig>;
    protected _blockedDevicesNavigation: INavigationOptionValue<INavigationSourceConfig>;

    protected _itemActions: object[];
    protected _itemActionFailedTries: object[];
    protected _itemActionBlockedDevices: object[];

    protected _columns: INoStickyLadderColumn[] = getColumns();

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: TItems): Promise<TItems> | void {
        this._devicesNavigation = {
            source: 'page',
            sourceConfig: {
                pageSize: MIN_PAGE_SIZE,
                page: 0,
                hasMore: false
            }
        };
        this._blockedDevicesNavigation = {
            source: 'page',
            sourceConfig: {
                pageSize: MIN_PAGE_SIZE,
                page: 0,
                hasMore: false
            }
        };

        this._itemActions = getActionsForDevices();
        this._itemActionFailedTries = getActionsForFailedTries();
        this._itemActionBlockedDevices = getActionsForBlockedDevices();

        this._activityDevicesLoadCallback = this._dataLoadedCallback.bind(this, 'activityDevices');
        this._blockedDevicesLoadCallback = this._dataLoadedCallback.bind(this, 'blockedDevices');
        this._failingAuthLoadCallback = this._dataLoadedCallback.bind(this, 'failingAuth');

        if (receivedState) {
            this._setSource(receivedState);
        } else {
            return this._loadData();
        }
    }

    private _getSbisService() {
        return {
            call: () => Promise.resolve(),
            query: () => Promise.resolve()
        };
        // return  new SbisService({
        //     endpoint: {
        //         contract: 'UserDevice',
        //         address: '/userdevice/service/'
        //     },
        //     binding: {
        //         query: 'ListFailingAuth'
        //     }
        // });
    }

    private _loadData(): Promise<void> {
        const fullUserActivityPromise = this._loadFullUserActivity();
        const failingAuthPromise = this._loadFailingActivity();

         return Promise.all([fullUserActivityPromise, failingAuthPromise]).then((values) => {
             return  {
                 activityDevices: values[0].activityDevices,
                 lockedDevices: values[0].activityDevices,
                 failingAuth: values[1]
             };
         });
    }

    private _loadFailingActivity(): Promise<void> {
        return new Promise((resolve) => {
            const request = this._getSbisService();
            const query = new Query();
            const limit = 20;
            query.limit(limit);
            query.where();
            request.query(query).then((data) => {
                // todo - раскомментить
                // const failingAuth = data.getAll();
                this._setSource({failingAuth});
                resolve(failingAuth);
            });
        });
    }

    private _loadFullUserActivity(): Promise<void> {
        return new Promise((resolve) => {
            const request = this._getSbisService();
            const list = new RecordSet();
            request.call('GetFullUserActivity', {Filter: list}).then((item) => {
                // todo - раскомментить
                // const data = {activityDevices: item.getRow().get('ActivityDevices'), lockedDevices: item.getRow().get('LockedDevices')};
                const data = {
                    activityDevices: mainRecord.get('ActivityDevices'),
                    lockedDevices: mainRecord.get('LockedDevices')
                };
                this._setSource(data);
                resolve(data);
            });
        });

    }

    private _dataLoadedCallback(listName: string, recordSet: RecordSet): void {
        this[`_${listName}RecordSet`] = recordSet;
        this._checkListVisibility(listName, recordSet);
    }

    private _checkListVisibility(listName: string, recordSet: RecordSet): void {
        this[`_${listName}Visible`] = !!recordSet.getCount();
        this._checkArrowVisible(listName, recordSet);
    }

    private _checkArrowVisible(listName: string, recordSet: RecordSet): void {
        this[`_${listName}ArrowVisible`] = recordSet.getCount() < recordSet.getMetaData().more || recordSet.getCount() > MIN_PAGE_SIZE;
    }

    protected _actionDevicesClick(event: Event, action, item): void {
        switch (action.id) {
            case actionType.clearSession:
                this._clearSessionDevice(item);
                break;
            case actionType.lockDevice:
                this._switchLock(item, true, true);
                break;
            case deviceType.computer:
                this._changeType(item, 1);
                break;
            case deviceType.home:
                this._changeType(item, 2);
                break;
            case deviceType.phone:
                this._changeType(item, 3);
                break;
            case deviceType.notDefined:
                this._changeType(item, 0);
                break;
        }
    }

    protected _actionBlockedDevicesClick(e, action, item, container): void {
        this._switchLock(item, false, false);
    }

    protected _actionFailedTriesClick(e, action, item, container): void {
        this._switchLock(item, true, false);
    }

    private _setSource(data): void {
        if (data.activityDevices) {
            this._viewSourceDevices = new Memory({
                keyProperty: '@Id',
                data: data.activityDevices.getRawData(),
                adapter: new adapter.Sbis()
            });
        }

        if (data.lockedDevices) {
            this._viewSourceBlockedDevices = new Memory({
                keyProperty: '@Id',
                data: data.lockedDevices.getRawData(),
                adapter: new adapter.Sbis()
            });
        }

        if (data.failingAuth) {
            this._viewSourceFailedTries = new Memory({
                keyProperty: '@Id',
                data: data.failingAuth.getRawData(),
                adapter: new adapter.Sbis()
            });
        }
    }

    private _getBLObject(): ICrud {
        // TODO:
        return {
            call: () => Promise.resolve(true)
        };
        // return new SbisService({
        //     endpoint: "ДоверенноеУстройство"
        // });
    }

    private _switchLock(item, lock, lockFromDevices): void {
        this._getBLObject().call(lock ? 'Lock' : 'Unlock', {
            id: item.get('@Id')
        }).then(() => {
            if (lock) {
                item.set('Blocked', true);
                if (!lockFromDevices) {
                    this._loadData();
                } else {
                    this._loadFullUserActivity();
                }
                // RecordSynchronizer.addRecord(item, {}, this._blockedDevicesRecordSet);
                // this._checkListVisibility('blockedDevices', this._blockedDevicesRecordSet);
            } else {
                this._loadData();
                // RecordSynchronizer.deleteRecord(this._blockedDevicesRecordSet, item.getId());
                // this._checkListVisibility('blockedDevices', this._blockedDevicesRecordSet);
            }
        }).catch(() => {
            const message = lock ? 'Не удалось заблокировать!' : 'Не удалось разблокировать!';
            this._children.devicesInfoPopup.open({
                message,
                type: 'ok'
            });
        });
    }

    private _changeType(item, type) {
        const changeType = () => {
            this._getBLObject().call('ChangeType', {
                device_id: item.get('DeviceId'),
                device_type: type
            }).then(() => {
                item.set('DeviceType', type);
            }).catch(() => {
                const message = 'Не удалось поменять тип устройства';
                this._children.devicesInfoPopup.open({
                    message,
                    type: 'ok'
                });
            });
        };
        if (item.get('DeviceType') === 1) {
            new SbisService({
                endpoint: 'UnproductiveLog'
            }).call('GetSettings', {}).then((result) => {
                if (result && result.getRow && result.getRow().get('IsEnabled')) {
                    const message = 'Изменив статус устройства на рабочий, вы разрешаете системе вести учет времени использования программ и посещения сайтов с этого устройства.';
                    this._children.devicesInfoPopup.open({
                        message,
                        details: 'Сохранить изменения?',
                        type: 'yesno'
                    }).then((answer) => {
                        if (answer) {
                            changeType();
                        }
                    });
                } else {
                    changeType();
                }
            }).catch(() => {
                changeType();
            });
        } else {
            changeType();
        }
    }

    private _clearSessionDevice(item) {
        const clearSession = () => {
            this._getBLObject().call('ClearSession', {
                key: item.get('@Id')
            }).then(() => {
                this._children.devices.reload();
            }).catch(() => {
                const message = 'Не удалось завершить сессию';
                this._children.devicesInfoPopup.open({
                    message,
                    type: 'ok'
                });
            });
        };

        if (item.CurrentDevice) {
            const message = 'Завершить текущий сеанс?';
            this._children.devicesInfoPopup.open({
                message,
                type: 'yesno'
            }).then((answer) => {
                if (answer) {
                    clearSession();
                }
            });
        } else {
            clearSession();
        }
    }

    private _toggleDevices(): void {
        if (this._activityDevicesArrowVisible) {
            this._activityDevicesArrowExpanded = !this._activityDevicesArrowExpanded;
            if (this._activityDevicesArrowExpanded) {
                this._devicesNavigation.sourceConfig.pageSize = MAX_PAGE_SIZE;
            } else {
                this._devicesNavigation.sourceConfig.pageSize = MIN_PAGE_SIZE;
            }
            this._children.devices.reload();
        }
    }

    private _toggleBlockedDevices(): void {
        if (this._blockedDevicesArrowVisible) {
            this._blockedDevicesArrowExpanded = !this._blockedDevicesArrowExpanded;
            if (this._blockedDevicesArrowExpanded) {
                this._blockedDevicesNavigation.sourceConfig.pageSize = MAX_PAGE_SIZE;
            } else {
                this._blockedDevicesNavigation.sourceConfig.pageSize = MIN_PAGE_SIZE;
            }
            this._children.blockedDevices.reload();
        }
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/DevicesInfo/DevicesInfo'];
}
