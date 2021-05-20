import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/FormController/ControllerBase/PopupTemplate/PopupTemplate');
import {Confirmation} from 'Controls/popup';
import { SyntheticEvent } from 'UICommon/Events';
import {Model} from 'Types/entity';
import 'css!Controls-demo/FormController/ControllerBase/PopupTemplate/PopupTemplate';
class BaseTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _editingObject: object;
    protected _propertyGridSource: any[] = [
        {
            name: 'operation',
            caption: 'Регламент',
            type: 'string'
        },
        {
            name: 'storage',
            caption: 'Хранилище',
            type: 'string'
        },
        {
            name: 'milestone',
            caption: 'Веха',
            type: 'string'
        }
    ];

    protected _validationFailedHandler(): void {
        Confirmation.openPopup({
            message: 'Валидация не прошла!',
            style: 'danger',
            type: 'ok'
        });
    }

    protected _editingObjectChanged(event: SyntheticEvent<Event>, newValue: Model): void {
        this._options.record.set(newValue.getRawData());
    }
    protected _updateSuccessedHandler(event: SyntheticEvent<MouseEvent>, record: Model): void {
        this._options.saveCallback(record);
    }
    protected _saveClickHandler(): void {
        this._children.formController.update().then((result) => {
            if (!result.hasErrors) {
                this._notify('close', [], {bubbling: true});
            }
        });
    }
}
export default BaseTemplate;
