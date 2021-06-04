import {default as BaseController, ITemplateControllerOptions} from './Base';
import {ITableConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {TreeItem} from 'Controls/display';

export default class ListController extends BaseController<ITableConfig, TreeItem> {
    constructor(options: ITemplateControllerOptions) {
        super(options);
    }

    protected _getViewModeConfig(): ITableConfig {
        return this._$listConfiguration.table;
    }

    get imageViewMode(): string {
        if (this.getImageVisibility() === 'hidden') {
            return 'none';
        } else {
            return this._viewModeConfig.leaf.imageViewMode;
        }
    }
}
