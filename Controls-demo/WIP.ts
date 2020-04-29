import {Control, IControlOptions, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/WIPPlaceholder/WIPPlaceholder"
import {cookie} from "Env/Env"

export interface IWIPOptions extends IControlOptions {
    byTask?: string
    afterSolve?: string
}

export default class extends Control<IWIPOptions> {
    protected _template: TemplateFunction = Template;
    protected _canShowTask: boolean = false;

    constructor(cfg: IWIPOptions){
        super(cfg);
        this._canShowTask = cookie.get('s3debug') === 'true';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}