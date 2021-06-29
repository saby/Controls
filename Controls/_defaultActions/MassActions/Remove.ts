import rk = require('i18n!Controls');
import MassAction from './MassAction';
import {RecordSet} from 'Types/collection';

export default class Remove extends MassAction {
    constructor(options) {
        super(options);
    }

    onCollectionChanged(items: RecordSet): void {}

    onSelectionChangedHandler(items: RecordSet): void {}
}

Object.assign(Remove.prototype, {
    _$id: 'remove',
    _$title: rk('Удалить'),
    _$icon: 'icon-Erase',
    _$iconStyle: 'danger',
    _$commandName: 'Controls/listActions:Remove',
    _$viewCommandName: 'Controls/viewCommands:Reload'
});
