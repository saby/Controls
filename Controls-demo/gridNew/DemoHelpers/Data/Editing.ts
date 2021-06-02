import {IColumn} from "Controls/_grid/display/interface/IColumn";
import * as resTpl from 'wml!Controls-demo/gridNew/EditInPlace/EditingCell/resultsTpl';
import { IHeaderCell } from "Controls/grid";

export interface IEditingData {
    key: number | string;
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
            key: 1,
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
            required: '+79069953970',
            length: '1234',
            title: 'Тандер, АО (Магнит)'
        },
        {
            id: '2',
            email: 'artem@gmail.com',
            required: '+74951235469',
            length: '123',
            title: 'Абак, ООО'
        },
        {
            id: '3',
            email: 'oleg@gmail.com',
            required: '+79156542315',
            length: '2121',
            title: 'Основа, ООО'
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
            width: '150px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorEmail'
        },
        {
            displayProperty: 'required',
            width: '105px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorRequired'
        },
        {
            displayProperty: 'length',
            width: '59px',
            template: 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorLength'
        },
        {
            displayProperty: 'title',
            width: '150px',
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
