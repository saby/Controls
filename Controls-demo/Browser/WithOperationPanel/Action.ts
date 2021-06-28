import {Confirmation} from 'Controls/popup';
export default class {
    protected _name: string = '';
    constructor(actionOptions: { name: string; }) {
        this._name  = actionOptions.name;
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
