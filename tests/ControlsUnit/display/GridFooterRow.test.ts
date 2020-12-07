import { assert } from 'chai';
import { TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';

import { GridCollection } from 'Controls/display';
import GridFooterRow, { IOptions } from 'Controls/_display/GridFooterRow';
import { TColumns } from 'Controls/_grid/interface/IColumn';
import GridSpaceAfterBodyRow from 'Controls/_display/GridSpaceAfterBodyRow';

describe('Controls/display/GridFooterRow', () => {
    let owner: GridCollection<Model>;
    let options: IOptions<Model>;
    let needSpaceAfterBody: boolean;
    let columns: TColumns;
    let resultsPosition: string;
    let multiSelectVisibility: string;

    function initRow(): GridFooterRow<Model> {
        return new GridFooterRow(options);
    }

    beforeEach(() => {
        needSpaceAfterBody = true; // it happens if itemActionsPosition === 'outside' and items.count() > 0
        columns = [
            { width: '1fr' },
            { width: '1px' },
            { width: '1px' },
            { width: '1px' }
        ];
        resultsPosition = 'top';
        multiSelectVisibility = 'hidden';
        owner = {
            isNeedSpaceAfterBody(): boolean {
                return needSpaceAfterBody;
            },
            getSpaceAfterBody(): GridSpaceAfterBodyRow<Model> {
                return undefined;
            },
            getResultsPosition(): string {
                return resultsPosition;
            }
        } as Partial<GridCollection<Model>> as undefined as GridCollection<Model>;
        options = {
            owner,
            footer: columns,
            columns,
            footerTemplate: ((data: any) => null) as TemplateFunction,
            multiSelectVisibility: 'hidden'
        };
    });

    describe('getWrapperClasses', () => {
        it('should contain class to add min-height for footer', () => {
            const classes = initRow().getWrapperClasses(false, 'default');
            assert.include(classes, 'controls-GridView__footer__itemActionsV_outside_theme-default');
        });
    });
});
