import {default as BaseController, ITemplateControllerOptions} from './Base';
import {IListConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {TreeItem} from 'Controls/display';

export default class ListController extends BaseController<IListConfig, TreeItem> {
    constructor(options: ITemplateControllerOptions) {
        super(options);
    }

    protected _getViewModeConfig(): IListConfig {
        return this._$listConfiguration.list;
    }

    get imagePosition(): string {
        if (this.getImageVisibility() === 'hidden') {
            return 'none';
        } else {
            return this._viewModeConfig.list.imagePosition;
        }
    }

    get imageViewMode(): string {
        return this._viewModeConfig.list.imageViewMode;
    }
}
