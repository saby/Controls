export function itemActionsClick(self, event, action, itemData, listModel, showAll): void {
    event.stopPropagation();
    if (action._isMenu) {
        self._notify('menuActionsClick', [itemData, event, showAll]);
    } else if (action['parent@']) {
        self._notify('menuActionClick', [itemData, event, action]);
    } else {
        // TODO: self._container может быть не HTMLElement, а jQuery-элементом,
        //  убрать после https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        const container = self._container.get ? self._container.get(0) : self._container;
        const isNewModel = !!listModel.getSourceIndexByItem;

        let contents;
        if (isNewModel) {
            // TODO breadcrumbs for new model
            contents = itemData.getContents();
        } else {
            contents = itemData.item;
            if (itemData.breadCrumbs) {
                contents = contents[contents.length - 1];
            }
        }

        const itemIndex = isNewModel ? listModel.getSourceIndexByItem(itemData) : itemData.index;

        // Если используется новая модель, Controls/display уже подгружен. Когда переедем
        // с BaseControl, этот код останется работать только со старой моделью.
        const startIndex = isNewModel
            ? require('Controls/display').VirtualScrollController.getStartIndex(listModel)
            : listModel.getStartIndex();

        const targetContainer = Array.prototype.filter.call(
            container.querySelector('.controls-ListView__itemV').parentNode.children,
            (item: HTMLElement) => item.className.includes('controls-ListView__itemV')
        )[itemIndex - startIndex];

        const args = [
            action,
            contents,
            targetContainer
        ];
        self._notify('actionClick', args);
        if (action.handler) {
            action.handler(args[1]);
        }
    }
}
