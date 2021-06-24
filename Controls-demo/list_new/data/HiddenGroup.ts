import {groupConstants} from 'Controls/list';

export function getGroupedCatalogForSwitchingGroup(): Array<{
    id: number
    title: string
    group?: string
}> {
    return [
        {
            id: 1,
            title: '1 Первая запись в рекордсете',
            group: groupConstants.hiddenGroup
        },
        {
            id: 2,
            title: '2 Вторая запись в рекордсете',
            group: groupConstants.hiddenGroup
        },
        {
            id: 3,
            title: '3 Третья запись в рекордсете',
            group: 'Архив'
        },
        {
            id: 4,
            title: '4 Четвертая запись в рекордсете',
            group: 'Архив'
        },
        {
            id: 5,
            title: '5 Пятая запись в рекордсете',
            group: groupConstants.hiddenGroup
        },
        {
            id: 6,
            title: '6 Шестая запись в рекордсете',
            group: 'Архив'
        },
        {
            id: 7,
            title: '7 Седьмая запись в рекордсете',
            group: 'Архив'
        }
    ];
}

export function getGroupedCatalogWithHiddenGroup(): Array<{
    id: number
    title: string
    brand?: string
}> {
    return [
        {
            id: 1,
            title: 'WebCam X541SA-XO056D',
            brand: groupConstants.hiddenGroup
        },
        {
            id: 2,
            title: 'MacBook Pro',
            brand: 'apple'
        },
        {
            id: 3,
            title: 'ASUS X751SA-TY124D',
            brand: 'asus'
        },
        {
            id: 4,
            title: 'HP 250 G5 (W4N28EA)',
            brand: 'hp'
        },
        {
            id: 5,
            title: 'Apple iPad Pro 2016',
            brand: 'apple'
        },
        {
            id: 6,
            title: 'KeyBoard 5RTX-zxs',
            brand: 'unknown'
        },
        {
            id: 7,
            title: 'MagicMouse 2',
            brand: groupConstants.hiddenGroup
        },
        {
            id: 8,
            title: 'iPhone X Max',
            brand: 'apple'
        },
        {
            id: 9,
            title: 'ASUS Zenbook F-234',
            brand: 'asus'
        }
    ];
}
