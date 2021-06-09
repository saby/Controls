import {groupConstants} from 'Controls/display';

function getGroupedCatalog(): Array<{
    key: number
    title: string
    brand: string
    longBrandName: string
}> {
    return [
        {
            key: 1,
            title: 'MacBook Pro',
            brand: 'apple',
            longBrandName: 'apple'
        },
        {
            key: 2,
            title: 'ASUS X751SA-TY124D',
            brand: 'asus',
            longBrandName: 'asus'
        },
        {
            key: 3,
            title: 'HP 250 G5 (W4N28EA)',
            brand: 'hp',
            longBrandName: 'hp'
        },
        {
            key: 4,
            title: 'Apple iPad Pro 2016',
            brand: 'apple',
            longBrandName: 'apple'
        },
        {
            key: 5,
            title: 'ACER One 10 S1002-15GT',
            brand: 'acer',
            longBrandName: 'acer'
        },
        {
            key: 6,
            title: 'ASUS X541SA-XO056D',
            brand: 'asus',
            longBrandName: 'asus'
        },
        {
            key: 7,
            title: 'iPhone X Max',
            brand: 'apple',
            longBrandName: 'apple'
        },
        {
            key: 8,
            title: 'ASUS Zenbook F-234',
            brand: 'asus',
            longBrandName: 'AsusTek Computer Inc. stylised as ASUSTeK' +
                ' (Public TWSE: 2357 LSE: ASKD), based in Beitou District, Taipei, Taiwan'
        },
        {
            key: 9,
            title: 'ACER Aspire F 15 F5-573G-51Q7',
            brand: 'acer',
            longBrandName: 'acer'
        }
    ];
}

function getEditableGroupedCatalog(): Array<{
    key: number
    title: string
    brand: string
    longBrandName: string
}> {
    return [
        {
            key: 1,
            title: 'MacBook Pro',
            brand: groupConstants.hiddenGroup,
            longBrandName: 'apple'
        },
        {
            key: 2,
            title: 'ASUS X751SA-TY124D',
            brand: 'asus',
            longBrandName: 'asus'
        },
        {
            key: 3,
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
