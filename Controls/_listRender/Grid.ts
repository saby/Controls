import BaseRender from './Render';

import { TemplateFunction, IControlOptions } from 'UI/Base';
import { detection } from 'Env/Env';
import { GridCollection } from 'Controls/display';
import { Model } from 'Types/entity';

export interface IGridRenderOptions extends IControlOptions {
    listModel: GridCollection<Model>;

    style?: string;
    theme?: string;
}

export default class GridRender extends BaseRender {
    protected _options: IGridRenderOptions;

    protected _template: TemplateFunction;
    protected _itemTemplate: TemplateFunction;

    protected async _beforeMount(options): Promise<void> {
        super._beforeMount(options);

        this._templateKeyPrefix = `grid-render-${this.getInstanceId()}`;

        return new Promise((resolve) => {
            const layout = this._isFullGridSupport() ? 'grid' : 'table';
            require([
                `wml!Controls/_listRender/Grid/${layout}/Grid`,
                `wml!Controls/_listRender/Grid/${layout}/Item`
            ], (template, itemTemplate) => {
                this._template = template;
                this._itemTemplate = options.itemTemplate || itemTemplate;

                resolve();
            });
        });
    }

    protected _getGridClasses(): string {
        let classes = `controls-Grid controls-Grid_${this._options.style}_theme-${this._options.theme}`;
        if (!this._isFullGridSupport()) {
            classes += ' controls-Grid_table-layout controls-Grid_table-layout_fixed';
        }
        return classes;
    }

    protected _getGridStyles(): string {
        let styles = '';
        if (this._isFullGridSupport()) {
            const widths = this._options.listModel.getColumns().map(
                (column) => column.width || '1fr'
            );
            styles += ` grid-template-columns: ${widths.join(' ')};`;
        }
        return styles;
    }

    private _isFullGridSupport(): boolean {
        return (
            (!detection.isWinXP || detection.yandex) &&
            (
                !detection.isNotFullGridSupport ||
                (
                    detection.safari &&
                    (detection.isMacOSDesktop || detection.IOSVersion >= 12)
                )
            )
        );
    }

    static _theme: string[] = ['Controls/grid'];
}
