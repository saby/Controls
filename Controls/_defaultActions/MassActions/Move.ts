import rk = require('i18n!Controls');
import MassAction from './MassAction';
import {RecordSet} from 'Types/collection';

export default class Move extends MassAction {
    constructor(options) {
        super(options);
    }

    onCollectionChanged(items: RecordSet): void {}

    onSelectionChangedHandler(items: RecordSet): void {}
}

Object.assign(Move.prototype, {
    _$id: 'move',
    _$title: rk('Переместить'),
    _$icon: 'icon-Move',
    _$iconStyle: 'secondary',
    _$commandName: 'Controls/listActions:Move',
    _$viewCommandName: 'Controls/viewCommands:PartialReload'
});
