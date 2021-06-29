import {Confirmation} from 'Controls/popup';
import {BaseAction} from 'Controls/defaultActions';

export default class extends BaseAction {
    protected _name: string = '';
    constructor(options) {
        super(options);
        this._name  = options.actionOptions.name;
    }
    execute(meta: Record<string, any>): Promise<string> {
        const selectedKeys = meta.selection.selected;
        let message = '';
        if (!selectedKeys.length) {
            message = 'Не выбраны записи для выполнения команды';
        } else {
            message = `Будет выполнена команда "${this._name}" с выбранными ключами: ${selectedKeys.join(', ')}`;
        }
        new Confirmation({}).open({
            message,
            type: 'ok'
        });
        return Promise.resolve('reload');
    }
}
