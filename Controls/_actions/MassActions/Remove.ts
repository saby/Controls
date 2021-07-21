import * as rk from 'i18n!Controls';
import MassAction from './MassAction';

export default class Remove extends MassAction {
    constructor(options) {
        super(options);
    }
}

Object.assign(Remove.prototype, {
    id: 'remove',
    title: rk('Удалить'),
    icon: 'icon-Erase',
    iconStyle: 'danger',
    commandName: 'Controls/listActions:Remove',
    viewCommandName: 'Controls/viewCommands:PartialReload'
});
