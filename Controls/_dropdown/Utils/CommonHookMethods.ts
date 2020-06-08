import isEmpty = require('Core/helpers/Object/isEmpty');

function _beforeMountMethod(self, options, recievedState):void {
    if (!options.lazyItemsLoading) {
        if (!recievedState || isEmpty(recievedState)) {
            return self._controller.loadItemsOnMount();
        } else {
            self._controller.setItemsOnMount(recievedState);
        }
    }
}

export {
    _beforeMountMethod
}
