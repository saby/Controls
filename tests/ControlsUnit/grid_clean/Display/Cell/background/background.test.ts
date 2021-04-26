import { assert } from 'chai';
import { Model } from 'Types/entity';
import { GridRow, GridCell } from 'Controls/grid';

describe('Controls/grid/Display/Cell/background/background', () => {
    let cell: GridCell<Model, GridRow<Model>>;
    const owner = {
        getHoverBackgroundStyle: () => 'default',
        getTopPadding: () => 'default',
        getBottomPadding: () => 'default',
        getLeftPadding: () => 'default',
        getRightPadding: () => 'default',
        isDragged: () => false,
        getEditingBackgroundStyle: () => 'default',
        isActive: () => false,
        getRowSeparatorSize: () => 's',
        hasMultiSelectColumn: () => false,

        // owner methods for _getBackgroundColorWrapperClasses
        getEditingConfig: () => undefined,
        isEditing: () => false,
        hasColumnScroll: () => false
    } as undefined as GridRow<Model>;

    beforeEach(() => {
        cell = null;
    });

    describe('backgroundColorStyle has the highest priority', () => {
        cell = new GridCell({ owner, column: { width: ''} });
        // + backgroundStyle
        // + style
        // + backgroundColorStyle
        // - style=default
        // - backgroundStyle=default
        // = backgroundColorStyle

        // + backgroundStyle
        // - style
        // + backgroundColorStyle
        // - style=default
        // - backgroundStyle=default
        // = backgroundColorStyle

        // - backgroundStyle
        // + style
        // + backgroundColorStyle
        // - style=default
        // - backgroundStyle=default
        // = backgroundColorStyle

        // - backgroundStyle
        // - style
        // + backgroundColorStyle
        // + style=default
        // + backgroundStyle=default
        // = backgroundColorStyle
    });

    describe('backgroundStyle has higher priority than style', () => {
        // + backgroundStyle
        // + style
        // - backgroundColorStyle
        // - style=default
        // - backgroundStyle=default
        // = backgroundStyle

        // + backgroundStyle
        // - style
        // - backgroundColorStyle
        // - style=default
        // - backgroundStyle=default
        // = backgroundStyle

        // - backgroundStyle
        // - style
        // - backgroundColorStyle
        // + style=default
        // + backgroundStyle=default
        // = backgroundStyle

        // + backgroundStyle
        // - style
        // - backgroundColorStyle
        // + style=default
        // + backgroundStyle=default
        // = backgroundStyle

        // - backgroundStyle
        // + style
        // - backgroundColorStyle
        // - style=default
        // + backgroundStyle=default
        // = backgroundStyle
    });

    describe('NON-default style has higher priority than backgroundStyle=default', () => {
        // - backgroundStyle
        // - style
        // - backgroundColorStyle
        // - style=default
        // - backgroundStyle=default
        // = 'default'

        // - backgroundStyle
        // + style
        // - backgroundColorStyle
        // - style=default
        // - backgroundStyle=default
        // = style
    });
});




