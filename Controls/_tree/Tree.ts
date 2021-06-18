import { TemplateFunction } from 'UI/Base';
import { Logger } from 'UI/Utils';
import { descriptor } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';
import { Model } from 'Types/entity';

import { View as List } from 'Controls/list';
import TreeControl from 'Controls/_tree/TreeControl';
import ITree, { IOptions as ITreeOptions } from 'Controls/_tree/interface/ITree';
import TreeView from 'Controls/_tree/TreeView';

import 'css!Controls/treeGrid';

export default class Tree extends List implements ITree {
    protected _viewName: TemplateFunction = TreeView;
    protected _viewTemplate: TemplateFunction = TreeControl;

    _beforeMount(options: ITreeOptions): Promise<void> {

        if (!options.nodeProperty) {
            Logger.error('Не задана опция nodeProperty, обязательная для работы Controls/tree:View', this);
        }

        if (!options.parentProperty) {
            Logger.error('Не задана опция parentProperty, обязательная для работы Controls/tree:View', this);
        }

        return super._beforeMount(options);
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
        return 'Controls/tree:TreeCollection';
    }

    static getOptionTypes(): object {
        return {
            parentProperty: descriptor(String).required()
        };
    }
}
