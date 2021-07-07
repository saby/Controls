import * as rk from 'i18n!Controls';
import MassAction from './MassAction';

export default class Move extends MassAction {
    constructor(options) {
        super(options);
    }
}

Object.assign(Move.prototype, {
    _$id: 'move',
    _$title: rk('Переместить'),
    _$icon: 'icon-Move',
    _$iconStyle: 'secondary',
    _$commandName: 'Controls/listActions:Move',
    _$viewCommandName: 'Controls/viewCommands:PartialReload'
});
