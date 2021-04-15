import {DetailViewMode} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {
    IListConfig, ImageGradient, ImageViewMode, ITableConfig,
    ITileConfig,
    ListImagePosition,
    NodesPosition, TileImagePosition, TileSize
} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';

const LIST_CFG: IListConfig = {
    list: {
        imagePosition: ListImagePosition.left
    },
    node: {
        descriptionLines: 4,
        position: NodesPosition.left
    },
    leaf: {
        descriptionLines: 3
    }
};

const TILE_CFG: ITileConfig = {
    tile: {
        size: TileSize.m,
        imagePosition: TileImagePosition.top
    },
    node: {
        descriptionLines: 3,
        position: NodesPosition.top,
        imageGradient: ImageGradient.custom,
        imageViewMode: ImageViewMode.rectangle
    },
    leaf: {
        descriptionLines: 3,
        imageGradient: ImageGradient.custom,
        imageViewMode: ImageViewMode.rectangle
    }
};

const TABLE_CFG: ITableConfig = {
    node: {
        position: NodesPosition.left
    },
    leaf: {
        descriptionLines: 2,
        imageViewMode: ImageViewMode.circle
    }
};

export function getListConfiguration(): Record<string, any> {
    return {
        settings: {
            access: 'global',
                accountViewMode: DetailViewMode.list,
                clientViewMode: DetailViewMode.list
        },
        list: LIST_CFG,
            tile: TILE_CFG,
        table: TABLE_CFG
    };
}
