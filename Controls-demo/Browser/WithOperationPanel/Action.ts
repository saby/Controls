import {Confirmation} from 'Controls/popup';
import {MassAction} from 'Controls/actions';

export default class extends MassAction {
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

    onSelectionChanged(items, selection): void {
        if (this._$id === 'sum') {
          if (selection.selected.length > 1) {
              this._$iconStyle = 'success';
          } else {
              this._$iconStyle = 'label'
          }
        }
    }
}
