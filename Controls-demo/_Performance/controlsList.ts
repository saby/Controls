interface IControlListItem {
    id: string;
    title: string;
}

const ControlsList: IControlListItem[] = [
    {
        id: 'Controls-demo/Buttons/ViewModes/Index',
        title: 'Button'
    },
    {
        id: 'Controls-demo/Heading/Title/SizesAndStyles/Index',
        title: 'Heading'
    }
];

export function getControlsList(): Promise<IControlListItem[]> {
    return Promise.resolve(ControlsList);
}
