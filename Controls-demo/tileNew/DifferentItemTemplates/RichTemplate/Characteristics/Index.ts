import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentItemTemplates/RichTemplate/Characteristics/Template';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';

import {HierarchicalMemory} from 'Types/source';
import 'css!Controls/CommonClasses';

const characteristics = [
    [
        {
            icon: 'icon-Actor',
            tooltip: '1 Текст при наведении',
            title: 'Человек'
        },
        {
            icon: 'icon-Bell',
            tooltip: '2 Текст при наведении',
            title: 'Колокол'
        },
        {
            icon: 'icon-Bike',
            tooltip: '3 Текст при наведении',
            title: 'Велосипед'
        },
        {
            icon: 'icon-Admin',
            tooltip: '4 Текст при наведении',
            title: 'Гаечный Ключ'
        },
        {
            icon: 'icon-Android',
            tooltip: '5 Текст при наведении',
            title: 'Андроид'
        },
        {
            icon: 'icon-Attach',
            tooltip: '6 Текст при наведении',
            title: 'Скрепка'
        }
    ],
    [

        {
            icon: 'icon-Actor',
            tooltip: 'Человек'
        },
        {
            icon: 'icon-Bell',
            tooltip: 'Колокол'
        },
        {
            icon: 'icon-Bike',
            tooltip: 'Велосипед'
        },
        {
            icon: 'icon-Love',
            tooltip: 'Сердце'
        }
    ],
    [

        {
            imgSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEbSURBVDhPhZHNToNAFEandOFGYxpdmL6AD+DeF9Bt1935Yl122011ZyBqKG2ktIAkQmOcYuxEYhMaSAedltv28pNwNhw++ObCDPkrYz333ucx3GSRSJGl2esbD31ZZRBgioXEffa+NhLqg9k2yVAoMEOlSarcdxSa6oFcIbJePgNwQTRRzRAcyBZcY/Atlm9ct2/u2pdNkQSeYsPAFFwIdd3Prbf5pckUzcQFWx/iJ3uWH/I4AkcFpryyGDxHQs3pAnxXiMe2tUq1jBVVNPjYmjg8wuljd2QdxpZxdHHbumrWtxMCza54WxD5svYrrhLhM9XJ7Q3aVkTwZlghkRZPjruGqAL+Mxqy2n2n53JIqqmfSecn+OyqOD79BwcrqSPRiLawAAAAAElFTkSuQmCC',
            tooltip: 'Рецептурный товар'
        },
        {
            imgSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADvSURBVDhPY/z//z8DKQBVw/dXN87eufTw44c//4A8ZhYucXl5U2MFcU4miDwQwDX8+3zt1MbTb7+BOaiAVdHUylWLB8KBavh2+diqc+9/QcSwACYpI3sfXS4QC8T9fH03impBu3jvtHh1KSgXCP49O3f60mcQC6Th2bnHL0Fs/ODLpXMvgBRQw9tHr35DxPCDb69efQD74faWhTefgUSALrHSAMuhgjvIChDhRSQA2vDmxOoTl1CCE2IV3GAY4JINC9UD2iAsJ8YKFcILuMTEBCChJGUkKw4Rwwd49IwkgBTJEUdu0oACUhIfcYCBAQBlKYE+9zlSbAAAAABJRU5ErkJggg==',
            tooltip: 'Жизненноважное'
        },
        {
            imgSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGXSURBVDhPlVL9a4JQFPX//w+EgY3CKIoFvtaHJGm6SMy2Ph1Sy9jDxCAKghnF27tPm46NwQ73h+u75zzPffdyhJDwSeFzrcbsg+a/IpoZQg5VzQPNuUVTvrtHfA4J8iYu/4QnP1ICjXzT5SSWgaDunqB6jd7XU3Nuj5yVd7rAyXnVbsUcPmdwF389dYKtaeqrKzlu1EqiT6JieUdCdo5uBVvHWfln6OGGXb/8nR1H+SVMCICMYGzQsvBg2aNJo4j4Qlc152oNzEjja8LJCraqTC0umGuymdtuTMKqiPJqwHJAKsAKvaxrU8cUrt15Zk9wWbfzSFAwOwWkgmiogWNRkZqaCA/dKkn9WgnaqA3TEWV6uGCVWmeNij0f96hD9lm0cOyTISOg2E+qMSmNrr1PO6b4Elz3s3VIXJijqElVxFc1SaQCY0FOx4yGO77NTdPHliZAbdMpIL5k63XE122dNiCaHtwiq+4hjAfXuP09WY3o4M3wYtBvDJb4NYjAfXagBufKyj+Wr72EHtj2/rXeoQ4vButNyCfiIomHeTkt4wAAAABJRU5ErkJggg==',
            tooltip: 'Рецептурный товар'
        },
        {
            imgSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAD9SURBVDhPY/z//z8DKYAJShMNSNHw7tM3EjQ8vnn1Cw8XkRq+3Tm745GgthxIMUEN/z6cPbzqPKuJtRiEj1/D72dHDq66wWzhoScCFQFr+Pb2E5D8C+YjgW93du/fcveHlJ6BBi9UCAhAGrgEgL5nOHfozme4pr/vL20+uO/Zby45fR9doFcRAOwkZgkgYSr+ZuOG889+MTB8fnxo3bET7/4xcEm52kmBFCAB5Jj+eWf7vn0fWHkZfn4GamPgMvRxNBWGSCEAsqfZVWxUpf5CVDNJGZljqgYC1FDiVbFRA7mYTUzdDdXpCAB0Eip4c3zbuRd/oBxMQOvUysAAABCMgjoVvBy6AAAAAElFTkSuQmCC',
            tooltip: 'Ядовитые вещества'
        }
    ]
];
const DATA = [{
    id: 1,
    parent: null,
    type: null,
    title: 'Иконки с текстом',
    description: 'Элемент с описанием',
    imageProportion: '4:3',
    titleLines: 1,
    imagePosition: 'top',
    imageViewMode: 'rectangle',
    'parent@': null,
    imageHeight: 's',
    image: explorerImages[8],
    isShadow: true,
    characteristics: characteristics[0]
}, {
    id: 2,
    parent: null,
    type: null,
    imageProportion: '4:3',
    title: 'Только иконки',
    description: 'иконки шрифта cubic-icons в поле icon',
    titleLines: 5,
    'parent@': null,
    imagePosition: 'left',
    imageViewMode: 'ellipse',
    imageHeight: 'm',
    image: explorerImages[8],
    isShadow: true,
    characteristics: characteristics[1]
}, {
    id: 3,
    parent: null,
    type: null,
    title: 'Иконки в формате base64',
    imageProportion: '4:3',
    description: 'А на этой плитке характеристики имеют иконки в формате base64 в поле imgSrc',
    titleLines: 5,
    imageViewMode: 'ellipse',
    imagePosition: 'right',
    'parent@': null,
    imageHeight: 'l',
    image: explorerImages[8],
    isShadow: true,
    characteristics: characteristics[2]
}];

const ACTIONS = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: 0
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: 0
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory = null;
    protected _selectedKeys: string[] = [];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: DATA
        });
        this._itemActions = ACTIONS;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
