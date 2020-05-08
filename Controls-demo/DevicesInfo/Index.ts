import {Control, TemplateFunction} from 'UI/Base';
import {Memory, SbisService, ICrud, Query} from 'Types/source';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/DevicesInfo/DevicesInfo';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {adapter} from 'Types/entity';
import {RecordSet} from 'Types/collection';

import RecordSynchronizer = require('Controls/Utils/RecordSynchronizer');
import {getActionsForDevices, getColumns, getActionsForBlockedDevices, getActionsForFailedTries} from 'Controls-demo/DevicesInfo/DevicesInfoTools';
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
    private _blockedDevicesInvisible: boolean;
    private _failedTriesInvisible: boolean;

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

        this._blockedDevicesInvisible = false;
        this._failedTriesInvisible = false;

        this._blockedDevicesShown = false;
        this._devicesShown = false;

        this._itemActions = getActionsForDevices();
        this._itemActionFailedTries = getActionsForFailedTries();
        this._itemActionBlockedDevices = getActionsForBlockedDevices();

        if (receivedState) {
            this._activityDevicesRecord = receivedState.activityDevices;
            this._lockedDevicesRecord = receivedState.lockedDevices;
            this._failingAuthRecord = receivedState.failingAuth;
            this._setSource(receivedState);
        } else {
            return new Promise((resolve) => {
                // const request = new SbisService({
                //     endpoint: {
                //         contract: 'UserDevice',
                //         address: '/userdevice/service/'
                //     },
                //     binding: {
                //         query: 'ListFailingAuth'
                //     }
                // });
                // const record = new RecordSet();
                // const fullUserActivityPromise = request.call('GetFullUserActivity', {Filter: record}).then((item) => {
                //     resolve({activityDevices: item.getRow().get('ActivityDevices'), lockedDevices: item.getRow().get('LockedDevices')});
                // });
                // const query = new Query();
                // query.limit(20);
                // query.where();
                // const failingAuthPromise = request.query(query).then((item) => {
                //      resolve(item.getAll())
                // });

                const fullInfo = {
                    activityDevices: mainRecord.get('ActivityDevices'),
                    lockedDevices: mainRecord.get('LockedDevices'),
                    failingAuth: failingAuth
                };
                // Promise.all([fullUserActivityPromise, failingAuthPromise]).then((values) => {
                //     const fullInfo = {
                //         activityDevices: values[0].activityDevices,
                //         lockedDevices: values[0].activityDevices,
                //         failingAuth: values[1]
                //     };

                    this._setSource(fullInfo);
                    resolve(fullInfo);
                // });
            });
        }
    }

    protected _actionDevicesClick(event: Event, action, item): void {
        switch (action.id) {
            case 0:
                this._clearSessionDevice(item);
                break;
            case 1:
                this._switchLock(item, true , true);
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

    private _setSource(state): void {
        this._viewSourceDevices = new Memory({
            keyProperty: '@Id',
            data: state.activityDevices.getRawData(),
            adapter: new adapter.Sbis()
        });

        this._viewSourceBlockedDevices = new Memory({
            keyProperty: '@Id',
            data: state.lockedDevices.getRawData(),
            adapter: new adapter.Sbis()
        });
        if (!state.lockedDevices.getRawData()) {
            this._blockedDevicesInvisible = true;
        }
        this._viewSourceFailedTries = new Memory({
            keyProperty: '@Id',
            data: state.failingAuth.getRawData(),
            adapter: new adapter.Sbis()
        });
        if (!state.failingAuth.getRawData()) {
            this._failedTriesInvisible = true;
        }
    }

    private _getBLObject(): ICrud {
        return new SbisService({
            endpoint: "ДоверенноеУстройство"
        });
    }

    private _switchLock(item, lock, lockFromDevices): void {
        this._getBLObject().call(lock? "Lock" : "Unlock", {
            "id": item.get('@Id')
        }).then(() => {
            if (lock) {
                const record = lockFromDevices? this._activityDevicesRecord : this._failingAuthRecord;
                    RecordSynchronizer.deleteRecord(record, item.getId());

                    if (lockFromDevices) {
                        this._viewSourceDevices = new Memory({
                            keyProperty: '@Id',
                            data: this._activityDevicesRecord.getRawData(),
                            adapter: new adapter.Sbis()
                        });
                    } else {
                        this._viewSourceFailedTries = new Memory({
                            keyProperty: '@Id',
                            data: this._failingAuthRecord.getRawData(),
                            adapter: new adapter.Sbis()
                        });
                    }

                item.set('Blocked', true);
                RecordSynchronizer.addRecord(item, {}, this._lockedDevicesRecord);
                this._blockedDevicesInvisible = true;
                this._forceUpdate();
            } else {
                RecordSynchronizer.deleteRecord(this._lockedDevicesRecord, item.getId());
                if (!this._viewSourceBlockedDevices.data.d.length) {
                    this._blockedDevicesInvisible = true;
                    this._forceUpdate();
                }
            }
            this._viewSourceBlockedDevices = new Memory({
                keyProperty: '@Id',
                data: this._lockedDevicesRecord.getRawData(),
                adapter: new adapter.Sbis()
            });
        }).catch(() => {
             const message = lock ? "Не удалось заблокировать!" : "Не удалось разблокировать!";
             this._children.devicesInfoPopup.open({
                 message: message,
                 type: 'ok'
             });
        });
    }

    private _changeType(item, type) {
        let changeType = () => {
            this._getBLObject().call('ChangeType', {
                device_id: item.get('DeviceId'),
                device_type: item.get('DeviceType')
            }).then(() => {
                this._children.child.reload();
            }).catch(() => {
                const message = 'Не удалось поменять тип устройства';
                this._children.devicesInfoPopup.open({
                    message: message,
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
                        message: message,
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
            }).addErrBack(function () {
                changeType();
            });
        } else {
            changeType();
        }
    }

    private _clearSessionDevice(item) {
        let clearSession = () => {
            this._getBLObject().call("ClearSession", {
                "key" : item.get("@Id")
            }).then(() => {
                this._children.devices.reload();
            }).catch(() => {
                const message = 'Не удалось завершить сессию';
                this._children.devicesInfoPopup.open({
                    message: message,
                    type: 'ok'
                });
            });
        };

        if (item['CurrentDevice']) {
            const message = 'Завершить текущий сеанс?';
            this._children.devicesInfoPopup.open({
                message: message,
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
