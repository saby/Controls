import isEmpty = require('Core/helpers/Object/isEmpty');

function beforeMountMethod(self, options, recievedState): void {
    if (!options.lazyItemsLoading) {
        if (!recievedState || isEmpty(recievedState)) {
            return self._controller.loadItemsOnMount();
        } else {
            self._controller.setItemsOnMount(recievedState);
        }
    }
}

function afterMountMethod(self, needSetChildren): void {
    self._controller.setMenuPopupTarget(needSetChildren ? self._container.children[0] : self._container);
    self._controller.registerScrollEvent(self);
}

export {
    beforeMountMethod,
    afterMountMethod
};
