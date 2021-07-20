import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/extendedEditors/BooleanGroup';
import {SyntheticEvent} from 'Vdom/Vdom';
import IEditor from 'Controls/_propertyGrid/IEditor';
import {RecordSet} from 'Types/collection';
import IEditorOptions from 'Controls/_propertyGrid/IEditorOptions';

export interface IPropertyGridButton {
    id: string;
    tooltip: string;
    icon: string;
}

interface IOptions extends IEditorOptions, IControlOptions {
    buttons: IPropertyGridButton[];
    propertyValue: boolean[];
}

/**
 * Редактор для набора логических значений.
 *
 * @extends UI/Base:Control
 * @implements Controls/propertyGrid:IEditor
 * @demo Controls-demo/PropertyGridNew/Editors/BooleanGroup/Demo
 * @public
 * @author Борисов А.Н.
 */

export default class BooleanGroupEditor extends Control<IOptions> implements IEditor {
    protected _template: TemplateFunction = template;
    protected _buttons: RecordSet<IPropertyGridButton>;
    protected _stateOfButtons: boolean[];

    protected _beforeMount({propertyValue, buttons}: IOptions): void {
        this._stateOfButtons = propertyValue;
        this._buttons = new RecordSet({
            keyProperty: 'id',
            rawData: buttons
        });
    }

    protected _valueChangedHandler(event: SyntheticEvent, index: string, newValue: boolean): void {
        this._stateOfButtons[index] = newValue;
        this._stateOfButtons = this._stateOfButtons.slice();
        this._notify('propertyValueChanged', [this._stateOfButtons], {bubbling: true});
    }
}
