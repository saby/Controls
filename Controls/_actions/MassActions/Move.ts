import * as rk from 'i18n!Controls';
import MassAction from './MassAction';

export default class Move extends MassAction {
    constructor(options) {
        super(options);
    }
}

Object.assign(Move.prototype, {
    id: 'move',
    title: rk('Переместить'),
    icon: 'icon-Move',
    iconStyle: 'secondary',
    commandName: 'Controls/listActions:Move',
    viewCommandName: 'Controls/viewCommands:PartialReload'
});
