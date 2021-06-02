import {IColumn} from "Controls/_grid/display/interface/IColumn";
import {IData} from "Controls-demo/gridNew/DemoHelpers/DataCatalog";

export const Ports = {
    getData: (): IData[] => [
        {
            key: 1,
            name: 'Новороссийский морской торговый порт',
            invoice: 3500,
            documentSign: 1,
            documentNum: 10,
            taxBase: 17215.00,
            document: 'б/н',
            documentDate: null,
            serviceContract: null,
            description: 'морской/речной',
            shipper: null
        },
        {
            key: 2,
            name: 'Морской порт Санкт-Петербург',
            invoice: 3501,
            documentSign: 1,
            documentNum: 10,
            taxBase: 21015.00,
            document: '48000560-ABCC',
            documentDate: null,
            serviceContract: null,
            description: 'морской/речной',
            shipper: null
        },
        {
            key: 3,
            name: 'Морской торговый порт Усть-Луга',
            invoice: 3502,
            documentSign: 2,
            documentNum: 10,
            taxBase: 890145.04,
            document: '456990005',
            documentDate: null,
            serviceContract: null,
            description: 'ж/д, морской/речной',
            shipper: null
        }
    ],
    getColumns: (): IColumn[] => [
        {
            width: '100px',
            displayProperty: 'invoice'
        },
        {
            width: '200px',
            displayProperty: 'documentSign'
        },
        {
            width: '200px',
            displayProperty: 'document'
        },
        {
            width: '1fr',
            displayProperty: 'description'
        },
        {
            width: '200px',
            displayProperty: 'taxBase'
        }
    ],
    getColumnsDND: (): IColumn[] => [
        {
            width: '100px',
            displayProperty: 'invoice'
        },
        {
            width: '200px',
            displayProperty: 'documentNum'
        },
        {
            width: '200px',
            displayProperty: 'taxBase'
        },
        {
            width: '1fr',
            displayProperty: 'description'
        },
        {
            width: '200px',
            displayProperty: 'document'
        }
    ],
    getDocumentSigns: (): Array<{ key: number, title: string }> => [
        {
            key: 1,
            title: 'ТД предусмотрено'
        },
        {
            key: 2,
            title: 'ТД не предусмотрено'
        }
    ]
}
