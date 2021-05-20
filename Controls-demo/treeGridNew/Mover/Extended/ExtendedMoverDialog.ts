import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Mover/Extended/ExtendedMoverDialog/ExtendedMoverDialog';
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import { SyntheticEvent } from 'UICommon/Events';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    private _moverItemsCount: number;
    protected _filter: object = {};

    protected _beforeMount(): void {
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, item: Record): void {
        this._applyMove(item);
    }

    protected moveToRoot(): void {
        this._applyMove(null);
    }

    protected _applyMove(item: Record): void {
        this._notify('sendResult', [item], {bubbling: true});
        this._notify('close', [], {bubbling: true});
    }

    protected _dataLoadCallback(items: RecordSet): void {
        this._moverItemsCount = items.getCount();
    }

    protected _createFolderButtonClick(): void {
        // tslint:disable-next-line
        const self = this;
        this._children.dialogOpener.open({
            eventHandlers: {
                onResult: (folderName): void => {
                    self._options.source.update(new RecordSet({
                        rawData: [{
                            id: ++self._moverItemsCount,
                            title: folderName,
                            parent: null,
                            type: true
                        }]
                    })).then(() => {
                        self._children.moverExplorer.reload();
                    });
                }
            }
        });
    }

    moveItemsWithDialog(params: unknown): void {
        this._children.listMover.moveItemsWithDialog(params);
    }

    static _styles: string[] = ['Controls-demo/treeGridNew/Mover/Extended/ExtendedMoverDialog/ExtendedMoverDialog'];
}
