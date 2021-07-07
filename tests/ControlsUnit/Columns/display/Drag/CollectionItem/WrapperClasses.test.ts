import {ColumnsCollectionItem as CollectionItem} from 'Controls/columns';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/columns/display/Drag/CollectionItem/WrapperClasses', () => {
    const owner = {
        getHoverBackgroundStyle: () => null,
        getEditingBackgroundStyle: () => null,
        isDragging: () => true,
        isFirstItem: () => false,
        isLastItem: () => false,
        getNavigation: () => ({})
    };

    it('when drag should disable hover', () => {
        const item = new CollectionItem({owner});
        CssClassesAssert.notInclude(item.getWrapperClasses(), 'controls-ColumnsView__item_hovering');
    });

    it('is dragged item', () => {
        const item = new CollectionItem({owner, dragged: true});
        CssClassesAssert.include(item.getWrapperClasses(), 'controls-ColumnsView__item_dragging');
    });

    it('is node target', () => {
        const item = new CollectionItem({owner});
        item.setDragTargetNode(true);
        CssClassesAssert.include(item.getWrapperClasses(), 'controls-ColumnsView__dragTargetNode');
    });
});
