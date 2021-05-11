import {VersionableMixin, OptionsToPropertyMixin} from 'Types/entity';
import {IBrowserViewConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {mixin} from 'Types/util';
import {TreeItem} from 'Controls/display';

export type TImageVisibility = 'hidden' | 'visible';
export interface ITemplateControllerOptions {
    listConfiguration: IBrowserViewConfig;
    imageVisibility: TImageVisibility;
    browserOptions: IOptions;
}

export default abstract class BaseTemplateController<T, V extends TreeItem = TreeItem> extends
    mixin<VersionableMixin>(
        VersionableMixin,
        OptionsToPropertyMixin
) {
    protected _$listConfiguration: IBrowserViewConfig = null;
    protected _$imageVisibility: TImageVisibility = null;
    protected _$browserOptions: IOptions = null;
    protected _viewModeConfig: T;

    constructor(options: ITemplateControllerOptions) {
        super();
        OptionsToPropertyMixin.apply(this, arguments);
        VersionableMixin.apply(this, arguments);
        this._viewModeConfig = this._getViewModeConfig();
    }

    get imageProperty(): string {
        return this._$browserOptions.detail.imageProperty;
    }

    getImageVisibility(): TImageVisibility {
        return this._$imageVisibility;
    }

    setImageVisibility(visibility: TImageVisibility): void {
        if (this.getImageVisibility() !== visibility) {
            this._$imageVisibility = visibility;
            this._nextVersion();
        }
    }

    getDescription(item: TreeItem): string {
        return item.contents.get(this.getDescriptionProperty(item));
    }

    getDescriptionLines(item: TreeItem): number {
        const config = this._isNode(item) ? this._viewModeConfig.node : this._viewModeConfig.leaf;
        return config.descriptionLines;
    }

    getDescriptionProperty(item: TreeItem): string {
        return this._$browserOptions.detail.descriptionProperty;
    }

    protected _isNode(item: V): boolean {
        return item.isNode();
    }

    protected abstract _getViewModeConfig(): T;
}
