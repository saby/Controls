import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {factory} from 'Types/chain';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {Confirmation} from 'Controls/popup';
import * as Clone from 'Core/core-clone';
import DialogTemplate = require('wml!Controls/_filterPopup/History/_Favorite/EditDialog');

interface IEditDialog extends IControlOptions {
    items: object[];
    isClient: boolean;
    isFavorite: boolean;
    editedTextValue: string;
}

const globalConfig = new Memory({
    keyProperty: 'key',
    data: [
        {key: false, title: rk('Для меня')},
        {key: true, title: rk('Для всех'), comment: rk('Отчёт будет доступен для всех сотрудников')}
    ]
});

class EditDialog extends Control<IEditDialog> {
    protected _template: TemplateFunction = DialogTemplate;

    private _textValue: string;
    private _placeholder: string;
    private _isClient: boolean;
    private _globalSource = globalConfig;
    private _selectedFilters: string[];
    private _source: Memory;

    private isDisplayItem(item: object): boolean {
        return item.hasOwnProperty('value') && item.value && item.value.length !== 0 && item.textValue && item.visibility !== false;
    }

    private getItemsSource(self: EditDialog, items: object[]): Memory {
        const data = factory(items).filter((item) => {

            if (self.isDisplayItem(item)) {
                self._selectedFilters.push(item.id);
                return item;
            }
        }).value();

        return new Memory({
            keyProperty: 'id',
            data: data
        });
    }

    private prepareConfig(self: EditDialog, options: IEditDialog): void {
        self._placeholder = options.editedTextValue;
        self._textValue = options.isFavorite ? options.editedTextValue : '';
        self._isClient = options.isClient;
        self._selectedFilters = [];
        self._source = self.getItemsSource(self, options.items);
    }

    protected _beforeMount(options: IEditDialog): void {
        this.prepareConfig(this, options);
    }

    protected _beforeUpdate(newOptions: IEditDialog): void {
        if (newOptions.items !== this._options.items || newOptions.isClient !== this._options.isClient ||
            newOptions.isFavorite !== this._options.isFavorite || newOptions.editedTextValue !== this._options.editedTextValue) {
            this.prepareConfig(this, newOptions);
        }
    }

    protected _delete(): void {
        this.sendResult({action: 'delete', isClient: this._isClient});
    }

    protected _apply(): void {
        if (!this._selectedFilters.length) {
            this.showConfirmation();
        } else {
            const result = {
                action: 'save',
                record: new Model({
                    rawData: {
                        items: this.getItemsToSave(this._options.items, this._selectedFilters),
                        linkText: this._textValue || this._placeholder,
                        isClient: this._isClient
                    }
                })
            };
            this.sendResult(result);
        }
    }

    private sendResult(result: object): void {
        this._notify('sendResult', [result]);
        this._notify('close', [], {bubbling: true});
    }

    private showConfirmation(): void {
        Confirmation.openPopup({
            message: rk('Выберите параметры фильтрации для сохранения'),
            type: 'ok',
            style: 'danger'
        });
    }

    private getItemsToSave(items: object[], selectedFilters: string[]): void {
        let resultItems = Clone(items);
        factory(resultItems).each((item) => {
            if (!selectedFilters.includes(item.id) && this.isDisplayItem(item)) {
                item.textValue = '';
                item.value = null;
            }
        });
        return resultItems;
    }

    static getDefaultOptions(): object {
        return {
            isClient: false
        };
    }

    static _theme: string[] = ['Controls/filterPopup', 'Controls/Classes'];
}

export default EditDialog;
