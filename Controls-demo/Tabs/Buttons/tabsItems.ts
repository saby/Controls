import {constants} from 'Env/Env';

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
    getItems1: () => ([
        {
            id: '1',
            title: 'Вкладка',
            caption: 'Вкладка',
            mainCounter: 12
        },
        {
            id: '2',
            title: 'Вкладка',
            caption: 'Вкладка',
            mainCounter: 12
        },
        {
            id: '3',
            title: 'Вкладка',
            caption: 'Вкладка',
            mainCounter: 12
        }
    ]),
    getItems3: () => ([
        {
            id: '1',
            title: 'Вкладка',
            icon: 'EmptyMessage'
        },
        {
            id: '2',
            title: 'Вкладка',
            icon: 'EmptyMessage'
        },
        {
            id: '3',
            title: 'Вкладка',
            icon: 'EmptyMessage'
        }
    ]),
    getItems4: () => ([
        {
            id: '1',
            title: 'Вкладка',
            mainCounter: 12,
            icon: 'EmptyMessage'
        },
        {
            id: '2',
            title: 'Вкладка',
            mainCounter: 12,
            icon: 'EmptyMessage'
        },
        {
            id: '3',
            title: 'Вкладка',
            mainCounter: 12,
            icon: 'EmptyMessage'
        }
    ]),
    getItems5: () => ([
        {
            id: '1',
            icon: 'Lenta'
        },
        {
            id: '2',
            icon: 'Lenta'
        },
        {
            id: '3',
            icon: 'Lenta'
        }
    ]),
    getItems6: () => ([
        {
            id: '1',
            icon: 'EmptyMessage',
            mainCounter: 12
        },
        {
            id: '2',
            icon: 'EmptyMessage',
            mainCounter: 12
        },
        {
            id: '3',
            icon: 'EmptyMessage',
            mainCounter: 12
        }
    ]),
    getItems7: () => ([
        {
            id: '1',
            icon: 'Show',
            caption: 'Вкладка'
        },
        {
            id: '2',
            icon: 'Show',
            caption: 'Вкладка'
        },
        {
            id: '3',
            icon: 'Show',
            caption: 'Вкладка'
        }
    ]),
    getItems8: () => ([
        {
            id: '1',
            image: {
                src:  constants.resourceRoot + 'Controls-demo/Tabs/Buttons/NewTemplate/resource/image.png'
            },
            caption: 'Вкладка'
        },
        {
            id: '2',
            image: {
                src:  constants.resourceRoot + 'Controls-demo/Tabs/Buttons/NewTemplate/resource/image.png'
            },
            caption: 'Вкладка'
        },
        {
            id: '3',
            image: {
                src:  constants.resourceRoot + 'Controls-demo/Tabs/Buttons/NewTemplate/resource/image.png'
            },
            caption: 'Вкладка'
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
