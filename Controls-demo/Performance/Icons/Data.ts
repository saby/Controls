import {getIcon} from 'Controls/Utils/Icon';

interface IIconDemoItem {
    id: number;
    svgIcon: string;
    fontIcon: string;
    title: string;
}

export function getData(count: number = 50): IIconDemoItem[]  {
    const items = [];

    for (let i = 0; i < count; i++) {
        items.push({
            id: i,
            fontIcon: 'icon-Successful',
            svgIcon: 'Controls-demo/icons:icon-Successful',
            title: `Элемент ${i}`,
            svgIconUrl: getIcon('Controls-demo/icons:icon-Successful')
        });
    }
    return items;
}
