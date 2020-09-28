import {Record} from 'Types/entity';
import {IControlOptions} from 'UI/Base';
import {IFontSizeOptions} from 'Controls/interface';

export interface IBreadCrumbsOptions extends IControlOptions, IFontSizeOptions {
    items: Record[];
    keyProperty: string;
    parentProperty: string;
    displayProperty: string;
    containerWidth: number;
}
