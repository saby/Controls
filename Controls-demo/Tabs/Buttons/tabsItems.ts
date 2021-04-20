export const data = {
    getDefaultItems: () => ([
        {
            id: '1',
            title: 'Document'
        },
        {
            id: '2',
            title: 'Files'
        },
        {
            id: '3',
            title: 'Orders'
        }
    ]),

    getDefaultLeftItems() {
        const rawData = this.getDefaultItems()
        for (const item of rawData) {
            item.align = 'left';
        }
        return rawData;
    },

    getCustomItems: () => ([
        {
            id: '1',
            title: 'Document',
            caption: 'Документы'
        },
        {
            id: '2',
            title: 'Files',
            caption: 'Файлы'
        },
        {
            id: '3',
            title: 'Orders',
            caption: 'Заказы'
        }
    ])
};
