import { View as Grid } from 'Controls/gridNew';
import { TreeControl } from 'Controls/tree';
import { TemplateFunction } from 'UI/Base';
import { descriptor } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';
import TreeGridView from 'Controls/_treeGridNew/TreeGridView';
import TreeGridViewTable from 'Controls/_treeGridNew/TreeGridViewTable';
import { Model } from 'Types/entity';
import { isFullGridSupport } from 'Controls/display';

export default class TreeGrid extends Grid {
    protected _viewName: TemplateFunction = null;
    protected _viewTemplate: TemplateFunction = TreeControl;

    _beforeMount(options: any): Promise<void> {
        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? TreeGridView : TreeGridViewTable;
        return superResult;
    }

    _getModelConstructor(): string {
        return 'Controls/treeGrid:TreeGridCollection';
    }

    toggleExpanded(key: CrudEntityKey): Promise<void> {
        // @ts-ignore
        return this._children.listControl.toggleExpanded(key);
    }

    getNextItem(key: CrudEntityKey): Model {
        return this._children.listControl.getNextItem(key);
    }

    getPrevItem(key: CrudEntityKey): Model {
        return this._children.listControl.getPrevItem(key);
    }

    static _theme: string[] = ['Controls/treeGrid', 'Controls/grid'];

    static getOptionTypes(): object {
        return {
            keyProperty: descriptor(String).required(),
            parentProperty: descriptor(String).required()
        };
    }
}
