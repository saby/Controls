import {IColumn} from "Controls/_grid/display/interface/IColumn";
import * as resTpl from 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/resultsTpl';
import { IHeaderCell } from "Controls/grid";

export interface IEditingData {
    id: number | string;
    title?: string;
    description?: string;
    price?: string;
    balance?: string;
    balanceCostSumm?: string;
    reserve?: string;
    costPrice?: string;
    email?: string;
    required?: string;
    length?: string;
    documentSign?: number;
    taxBase?: number;
    document?: string;
}

export const Editing = {
    getEditingData: (): IEditingData[] => [
        {
            id: 1,
            title: 'Время',
            description: 'Погода',
            price: '1',
            balance: '1',
            balanceCostSumm: '2',
            reserve: '2',
            costPrice: '3'
        },
        {
            id: 2,
            title: 'Масса',
            description: 'Скорость',
            price: '1',
            balance: '1',
            balanceCostSumm: '2',
            reserve: '2',
            costPrice: '3'
        },
        {
            id: 3,
            title: 'Давление',
            description: 'Плотность',
            price: '1',
            balance: '1',
            balanceCostSumm: '2',
            reserve: '2',
            costPrice: '3'
        }
    ],
    getEditingAlignData: (): IEditingData[] => [
        {
            id: 1,
            title: 'Очень длинный текст, с выравниванием по правому краю.',
            description: 'Текст 1'
        },
        {
            id: 2,
            title: 'Длинный текст',
            description: 'Текст 2'
        },
        {
            id: 3,
            title: 'Текст',
            description: 'Текст 3'
        }
    ],
    getEditingValidationData: (): IEditingData[] => [
        {
            id: '1',
            email: 'semen@gmail.com',
            required: '89069953970',
            length: '1234',
            title: 'title'
        },
        {
            id: '2',
            email: 'artem@gmail.com',
            required: '89069953970',
            length: '123',
            title: 'title'
        },
        {
            id: '3',
            email: 'oleg@gmail.com',
            required: '89069953970',
            length: 'hello',
            title: 'title'
        }
    ],
    getEditingColumns: (): IColumn[] => [
        {
            displayProperty: 'title',
            width: '180px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor'
        },
        {
            displayProperty: 'price',
            width: '100px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor',
            resultTemplate: resTpl,
            results: 3
        },
        {
            displayProperty: 'balance',
            width: '100px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor',
            resultTemplate: resTpl,
            results: 3
        },
        {
            displayProperty: 'description',
            width: '200px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor'
        },
        {
            displayProperty: 'costPrice',
            width: '100px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor',
            resultTemplate: resTpl,
            results: 9
        },
        {
            displayProperty: 'balanceCostSumm',
            width: '100px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/_cellEditor',
            resultTemplate: resTpl,
            results: 6
        }
    ],
    getEditingAlignColumns: (): IColumn[] => [
        {
            displayProperty: 'title',
            width: '180px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Align/_cellEditor',
            align: 'right'
        },
        {
            displayProperty: 'description',
            width: '100px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Align/_cellEditor',
            align: 'right'
        }
    ],
    getEditingSizeColumns: (size): IColumn[] => [
        {
            displayProperty: 'title',
            width: '180px',
            template: `wml!Controls-demo/gridNew/EditInPlace/Size/${size}/_cellEditor`,
        },
        {
            displayProperty: 'description',
            width: '100px',
            template: `wml!Controls-demo/gridNew/EditInPlace/Size/${size}/_cellEditor`,
        }
    ],
    getEditingColumnsValidation: () => [
        {
            displayProperty: 'email',
            width: '200px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorEmail'
        },
        {
            displayProperty: 'required',
            width: 'max-content',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorRequired'
        },
        {
            displayProperty: 'length',
            width: 'max-content',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorLength'
        },
        {
            displayProperty: 'title',
            width: 'max-content',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorTitle'
        }
    ],
    getEditingHeaderValidations: (): IHeaderCell[] => [
        {
            title: 'email'
        },
        {
            title: 'required'
        },
        {
            title: 'Length'
        },
        {
            title: 'Title'
        }
    ]
}
