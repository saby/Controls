import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Tile/DifferentItemTemplates/RichTemplate/RichTemplate';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
