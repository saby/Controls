import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {factory} from 'Types/chain';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {Confirmation} from 'Controls/popup';
import {IFilterItem} from 'Controls/filter';
import * as Clone from 'Core/core-clone';
import DialogTemplate = require('wml!Controls/_filterPopup/History/_Favorite/EditDialog');
import 'css!Controls/filterPopup';
import 'css!Controls/CommonClasses';

interface IEditDialog extends IControlOptions {
    items: IFilterItem[];
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
    protected _globalSource: Memory = globalConfig;
    private _selectedFilters: string[];
    private _keyProperty: string;
    protected _source: Memory;

    private _getKeyProperty(items: IFilterItem[]): string {
        const firstItem = items[0];
        return firstItem.hasOwnProperty('id') ? 'id' : 'name';
    }

    private isDisplayItem(item: IFilterItem): boolean {
        return item.hasOwnProperty('value') && item.value?.length !== 0 && item.textValue && item.visibility !== false;
    }

    private getItemsSource(self: EditDialog, items: IFilterItem[]): Memory {
        const data = factory(items).filter((item) => {

            if (self.isDisplayItem(item)) {
                self._selectedFilters.push(item[this._keyProperty]);
                return !!item;
            }
        }).value();

        return new Memory({
            keyProperty: this._keyProperty,
            data
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
        this._keyProperty = this._getKeyProperty(options.items);
        this.prepareConfig(this, options);
    }

    protected _beforeUpdate(newOptions: IEditDialog): void {
        if (newOptions.items !== this._options.items ||
            newOptions.isClient !== this._options.isClient ||
            newOptions.isFavorite !== this._options.isFavorite ||
            newOptions.editedTextValue !== this._options.editedTextValue) {
            this._keyProperty = this._getKeyProperty(newOptions.items);
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
        const resultItems = Clone(items);
        factory(resultItems).each((item: IFilterItem) => {
            if (!selectedFilters.includes(item[this._keyProperty]) && this.isDisplayItem(item)) {
                item.textValue = '';
                item.value = null;
                item.visibility = item.visibility === true ? false : item.visibility;
            }
        });
        return resultItems;
    }

    static getDefaultOptions(): object {
        return {
            isClient: false
        };
    }
}

Object.defineProperty(EditDialog, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return EditDialog.getDefaultOptions();
   }
});

export default EditDialog;
