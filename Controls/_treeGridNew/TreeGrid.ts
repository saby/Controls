import { View as Grid } from 'Controls/gridNew';
import { TreeControl } from 'Controls/tree';
import { TemplateFunction } from 'UI/Base';
import {Logger} from 'UI/Utils';
import { descriptor } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';
import TreeGridView from 'Controls/_treeGridNew/TreeGridView';
import TreeGridViewTable from 'Controls/_treeGridNew/TreeGridViewTable';
import { Model } from 'Types/entity';
import { isFullGridSupport } from 'Controls/display';
import ITreeGrid, {IOptions as ITreeGridOptions} from 'Controls/_treeGridNew/interface/ITreeGrid';

export default class TreeGrid extends Grid implements ITreeGrid {
    protected _viewName: TemplateFunction = null;
    protected _viewTemplate: TemplateFunction = TreeControl;

    _beforeMount(options: ITreeGridOptions): Promise<void> {

        if (options.groupProperty && options.nodeTypeProperty) {
            Logger.error('Нельзя одновременно задавать группировку через ' +
                'groupProperty и через nodeTypeProperty.', this);
        }

        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? TreeGridView : TreeGridViewTable;
        return superResult;
    }

    toggleExpanded(key: CrudEntityKey): Promise<void> {
        // @ts-ignore
        return this._children.listControl.toggleExpanded(key);
    }

    goToPrev(): Model {
        return this._children.listControl.goToPrev();
    }

    goToNext(): Model {
        return this._children.listControl.goToNext();
    }

    getNextItem(key: CrudEntityKey): Model {
        return this._children.listControl.getNextItem(key);
    }

    getPrevItem(key: CrudEntityKey): Model {
        return this._children.listControl.getPrevItem(key);
    }

    protected _getModelConstructor(): string {
        return 'Controls/treeGrid:TreeGridCollection';
    }

    static _theme: string[] = ['Controls/treeGrid', 'Controls/grid'];

    static getOptionTypes(): object {
        return {
            keyProperty: descriptor(String).required(),
            parentProperty: descriptor(String).required()
        };
    }
}
