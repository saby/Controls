import {Control, TemplateFunction} from 'UI/Base';
import {Memory, SbisService, ICrud, Query} from 'Types/source';
import 'css!Controls-demo/DevicesInfo/DevicesInfo';
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

export default class extends Control {
    protected _template: TemplateFunction = Template;

    private _blockedDevicesShown: boolean;
    private _devicesShown: boolean;
    private _blockedDevicesVisible: boolean = false;
    private _failingAuthVisible: boolean = false;
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
                pageSize: 3,
                page: 0,
                hasMore: false
            }
        };
        this._blockedDevicesNavigation = {
            source: 'page',
            sourceConfig: {
                pageSize: 3,
                page: 0,
                hasMore: false
            }
        };

        this._blockedDevicesShown = false;
        this._devicesShown = false;

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
    }

    protected _actionDevicesClick(event: Event, action, item): void {
        switch (action.id) {
            case 0:
                this._clearSessionDevice(item);
                break;
            case 1:
                this._switchLock(item, true, true);
                break;
            case 3:
                this._changeType(item, 1);
                break;
            case 4:
                this._changeType(item, 2);
                break;
            case 5:
                this._changeType(item, 3);
                break;
            case 6:
                this._changeType(item, 4);
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
                RecordSynchronizer.mergeRecord(item, this._activityDevicesRecordSet, item.getId());
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
        if (this._viewSourceDevices.data.d.length > 3) {
            if (this._devicesShown) {
                this._devicesNavigation.sourceConfig.pageSize = 3;
            } else {
                this._devicesNavigation.sourceConfig.pageSize = 50;
            }
            this._children.devices.reload();
            this._devicesShown = !this._devicesShown;
        }
    }

    private _toggleBlockedDevices(): void {
        if (this._viewSourceBlockedDevices.data.d.length > 3) {
            if (this._blockedDevicesShown) {
                this._blockedDevicesNavigation.sourceConfig.pageSize = 3;
            } else {
                this._blockedDevicesNavigation.sourceConfig.pageSize = 50;
            }
            this._children.blockedDevices.reload();
            this._blockedDevicesShown = !this._blockedDevicesShown;
        }
    }
}
