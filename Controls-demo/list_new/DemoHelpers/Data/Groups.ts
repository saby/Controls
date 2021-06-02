import {groupConstants} from 'Controls/display';

function getGroupedCatalog(): Array<{
    id: number
    title: string
    brand: string
    longBrandName: string
}> {
    return [
        {
            id: 1,
            title: 'MacBook Pro',
            brand: 'apple',
            longBrandName: 'apple'
        },
        {
            id: 2,
            title: 'ASUS X751SA-TY124D',
            brand: 'asus',
            longBrandName: 'asus'
        },
        {
            id: 3,
            title: 'HP 250 G5 (W4N28EA)',
            brand: 'hp',
            longBrandName: 'hp'
        },
        {
            id: 4,
            title: 'Apple iPad Pro 2016',
            brand: 'apple',
            longBrandName: 'apple'
        },
        {
            id: 5,
            title: 'ACER One 10 S1002-15GT',
            brand: 'acer',
            longBrandName: 'acer'
        },
        {
            id: 6,
            title: 'ASUS X541SA-XO056D',
            brand: 'asus',
            longBrandName: 'asus'
        },
        {
            id: 7,
            title: 'iPhone X Max',
            brand: 'apple',
            longBrandName: 'apple'
        },
        {
            id: 8,
            title: 'ASUS Zenbook F-234',
            brand: 'asus',
            longBrandName: 'AsusTek Computer Inc. stylised as ASUSTeK' +
                ' (Public TWSE: 2357 LSE: ASKD), based in Beitou District, Taipei, Taiwan'
        },
        {
            id: 9,
            title: 'ACER Aspire F 15 F5-573G-51Q7',
            brand: 'acer',
            longBrandName: 'acer'
        }
    ];
}

function getEditableGroupedCatalog(): Array<{
    id: number
    title: string
    brand: string
    longBrandName: string
}> {
    return [
        {
            id: 1,
            title: 'MacBook Pro',
            brand: groupConstants.hiddenGroup,
            longBrandName: 'apple'
        },
        {
            id: 2,
            title: 'ASUS X751SA-TY124D',
            brand: 'asus',
            longBrandName: 'asus'
        },
        {
            id: 3,
            title: 'HP 250 G5 (W4N28EA)',
            brand: 'hp',
            longBrandName: 'hp'
        }
    ];
}

export {
    getGroupedCatalog,
    getEditableGroupedCatalog
};
