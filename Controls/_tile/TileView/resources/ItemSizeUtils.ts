export = {
    getItemSize: function (item, zoomCoefficient, tileMode) {
        var
            result,
            rectAfterZoom,
            imageWrapper,
            imageWrapperRect,
            tileContent = item.querySelector('.controls-TileView__itemContent'),
            tileContentRect = tileContent.getBoundingClientRect();

        tileContent.classList.add('controls-TileView__item_hovered');
        tileContent.classList.remove('controls-TileView__item_unfixed');
        tileContent.style.width = tileContentRect.width * zoomCoefficient + 'px';

        //Плитка с динамической шириной не увеличивается по высоте, при изменении ширины.
        //Поэтом при расчете размеров увеличенного элемента, сами увеличим высоту плитки.
        if (tileMode === 'dynamic') {
            imageWrapper = item.querySelector('.controls-TileView__imageWrapper');
            imageWrapperRect = imageWrapper.getBoundingClientRect();
            imageWrapper.style.height = imageWrapperRect.height * zoomCoefficient + 'px';
        }

        rectAfterZoom = tileContent.getBoundingClientRect();

        result = {
            width: rectAfterZoom.width,
            height: rectAfterZoom.height
        };

        if (tileMode === 'dynamic') {
            imageWrapper.style.height = imageWrapperRect.height + 'px';
        }
        tileContent.style.width = '';
        tileContent.classList.remove('controls-TileView__item_hovered');
        tileContent.classList.add('controls-TileView__item_unfixed');

        return result;
    }
};
