import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as ListTemplate from 'wml!Controls/_filterPanel/Editors/Lookup';
import {StackOpener} from 'Controls/popup';
import 'css!Controls/filterPanel';
import {List} from 'Types/collection';
import {Model} from 'Types/entity';

export interface ILookupEditorOptions extends IControlOptions {
    propertyValue: number[];
}

class LookupEditor extends Control<ILookupEditorOptions> {
    protected _template: TemplateFunction = ListTemplate;
    protected _selectedKeys: number[] = [];

    protected _beforeMount(options: ILookupEditorOptions): void {
        this._selectedKeys = options.propertyValue;
    }

    protected _beforeUpdate(options: ILookupEditorOptions): void {
        this._selectedKeys = options.propertyValue;
    }

    protected _handleExtendedCaptionClick(): void {
        const selectorOptions = this._options.selectorTemplate;
        const opener = new StackOpener();
        opener.open({
            ...{
                opener: this,
                templateOptions: {
                    ...selectorOptions.templateOptions,
                    ...{
                        selectedKeys: this._selectedKeys,
                        selectedItems: new List({
                            items: []
                        })
                    }
                },
                template: selectorOptions.templateName,
                eventHandlers: {
                    onResult: this._handleSelectorResult.bind(this)
                }
            },
            ...selectorOptions.popupOptions
        });
    }

    protected _handleSelectorResult(result: Model[]): void {
        const selectedKeys = [];
        result.forEach((item) => {
            selectedKeys.push(item.get(this._options.keyProperty));
        });
        this._selectedKeys = selectedKeys;
        this._notify('viewModeChanged', ['basic']);
    }

}

export default LookupEditor;
