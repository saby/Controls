import * as rk from 'i18n!Controls';
import MassAction from './MassAction';
import {IBaseActionOptions} from '../BaseAction';

export default class Remove extends MassAction {
    constructor(options: IBaseActionOptions) {
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
