define('Controls-demo/OperationsPanel/Demo/Data', function() {
   var
      data = {
         removeOperation: {
            id: 'remove',
            icon: 'icon-Erase icon-error',
            '@parent': false,
            title: 'Удалить',
            parent: null
         },
         moveOperation: {
            id: 'move',
            icon: 'icon-Move icon-medium',
            '@parent': false,
            title: 'В другой раздел',
            parent: null
         },
         itemActions: [{
            id: 'remove',
            icon: 'icon-Erase icon-error',
            showType: 2
         }, {
            id: 'moveUp',
            icon: 'icon-ArrowUp icon-primary',
            showType: 2
         }, {
            id: 'moveDown',
            icon: 'icon-ArrowDown icon-primary',
            showType: 2
         }],
         owners:  [
            { id: 0, title: 'По ответственному', owner: '0' },
            { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
            { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
            { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' },
            { id: 4, title: 'Чеперегин А.С.', owner: 'Чеперегин А.С.' },
         ]
      };
   return data;
});
