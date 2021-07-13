import * as rk from 'i18n!Controls';
import MassAction from './MassAction';

export default class Remove extends MassAction {
    constructor(options) {
        super(options);
    }
}

Object.assign(Remove.prototype, {
    _$id: 'remove',
    _$title: rk('Удалить'),
    _$icon: 'icon-Erase',
    _$iconStyle: 'danger',
    _$commandName: 'Controls/listActions:Remove',
    _$viewCommandName: 'Controls/viewCommands:PartialReload'
});
