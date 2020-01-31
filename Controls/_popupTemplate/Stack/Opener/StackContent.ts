import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls/_popupTemplate/Stack/Opener/StackContent');
import * as tmplNotify from 'Controls/Utils/tmplNotify';

interface IStackContentOptions extends IControlOptions {
    stackMaxWidth?: number;
    stackMinWidth?: number;
    stackWidth?: number;
}

class StackContent extends Control<IStackContentOptions> {
    // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
    protected _template: TemplateFunction = Template;
    protected _tmplNotify: Function = tmplNotify;
    protected _minOffset: number;
    protected _maxOffset: number;
    protected _beforeMount(options: IStackContentOptions): void {
        this._updateOffset(options);
    }

    protected _beforeUpdate(options: IStackContentOptions): void {
        this._updateOffset(options);
    }

    protected _canResize(propStorageId: string, width: number, minWidth: number, maxWidth: number): boolean {
        const canResize = propStorageId && width && minWidth && maxWidth && maxWidth !== minWidth;
        return !!canResize;
    }

    private _updateOffset(options: IStackContentOptions): void {
        // protect against wrong options
        this._maxOffset = Math.max(options.stackMaxWidth - options.stackWidth, 0);
        this._minOffset = Math.max(options.stackWidth - options.stackMinWidth, 0);
    }

}
export default StackContent;
