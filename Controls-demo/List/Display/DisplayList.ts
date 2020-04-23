import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { SyntheticEvent } from 'Vdom/Vdom';
import * as template from 'wml!Controls-demo/List/Display/DisplayList/DisplayList';

import { Controller as SourceController } from 'Controls/source';
import { CollectionItem, Collection, Abstract } from 'Controls/display';

import { ICrud } from 'Types/source';
import { RecordSet } from 'Types/collection';


interface IDisplayListOptions extends IControlOptions {
    keyProperty: string;
    displayProperty: string;

    source?: ICrud;

    _updateCounters?: boolean;
}

export default class DisplayList<TItem> extends Control<IDisplayListOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/List/Display/DisplayList/DisplayList'];

    private _sourceController: SourceController;
    private _collection: Collection<TItem>;
    private _recordSet: RecordSet<TItem>;

    protected _beforeMount(options: IDisplayListOptions) {
        if (options.source) {
            this._sourceController = new SourceController({
                source: options.source,
                keyProperty: options.keyProperty
            });
            return this.reload();
        }
    }

    public reload(options?: IDisplayListOptions): Promise<void> {
        return this._loadItems().then((rs) => {
            this._recordSet = rs;
            this._collection = this._prepareCollection(rs, options || this._options);
        });
    }

    public appendItems(items: TItem[]): void {
        this._recordSet.append(items);
    }

    public removeItem(key: string|number): void {
        const item = this._recordSet.getRecordById(key);
        if (item) {
            this._recordSet.remove(item);
        }
    }

    // for demo
    protected _afterMount(): void {
        this._notifyCountersChanged();
    }

    // for demo
    protected _afterUpdate(): void {
        this._notifyCountersChanged();
    }

    private _loadItems(): Promise<RecordSet<TItem>> {
        return this._sourceController.load();
    }

    private _prepareCollection(items: RecordSet<TItem>, options: IDisplayListOptions): Collection<TItem> {
        return Abstract.getDefaultDisplay(
            items,
            {
                idProperty: options.keyProperty,
                displayProperty: options.displayProperty
            }
        ) as Collection<TItem>;
    }

    protected _onItemClick(e: SyntheticEvent<MouseEvent>, item: CollectionItem<TItem>): void {
        // TODO remove, this is for demo
        this._collection.setMarkedItem(item);
        this._notify('itemClick', [item.getContents(), e], { bubbling: true });
    }

    private _notifyCountersChanged(): void {
        if (this._options._updateCounters) {
            this._notify(
                'countersChanged',
                [this._collection.getItemCounters()]
            );
        }
    }
}
