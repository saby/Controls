import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {StickyOpener} from 'Controls/popup';
import ApplyButton from 'Controls/_filterPanel/View/ApplyButton';
import 'css!Controls/filterPanel';

export abstract class BaseEditor extends Control<IControlOptions> {
    protected _applyButtonSticky: StickyOpener;
    protected _applyButtonTemplate: TemplateFunction = ApplyButton;
    protected _editorTarget: HTMLElement | EventTarget | Control<{}, void>;

    protected _notifyPropertyValueChanged(value: object, needCollapse?: boolean): void {
        if (needCollapse || this._options.filterViewMode !== 'default') {
            this._hideApplyButton();
            this._notify('propertyValueChanged', [value], {bubbling: true});
        } else {
            this._getApplyButtonSticky().open({
                opener: null,
                template: this._applyButtonTemplate,
                targetPoint: {
                    horizontal: 'right'
                },
                direction: {
                    horizontal: 'right'
                },
                target: this._editorTarget || this._container,
                eventHandlers: {
                    onResult: () => {
                        this._notify('propertyValueChanged', [value], {bubbling: true});
                        this._hideApplyButton();
                    }
                }
            });
        }
    }

    protected _hideApplyButton(): void {
        if (this._applyButtonSticky) {
            this._applyButtonSticky.close();
        }
    }

    private _getApplyButtonSticky(): StickyOpener {
        if (!this._applyButtonSticky) {
            this._applyButtonSticky = new StickyOpener();
        }
        return this._applyButtonSticky;
    }
}