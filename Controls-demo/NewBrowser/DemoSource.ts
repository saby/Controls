import {DataSet, HierarchicalMemory, Query} from 'Types/source';
import {
    DetailViewMode,
    IBrowserViewConfig,
    IListConfig,
    ImageGradient,
    ImageViewMode,
    ITableConfig,
    ITileConfig,
    ListImagePosition,
    NodesPosition,
    TileImagePosition,
    TileSize
} from 'Controls/newBrowser';

const QUERY_DELAY = 100;

export class DemoSource extends HierarchicalMemory {
    constructor(options?: any) {
        super(options);
    }

    query(query?: Query): Promise<DataSet> {
        const templateConfig = getFolderConfig(query);

        return super
            .query(query)
            // Создаем небольшую задержку тем самым создавая условия, подобные боевым,
            // когда выполняется настоящий запрос за данными.
            // Иначе немного поменяется логика работы контролов и TreeControl будет
            // делать reload списка, что вызовет дополнительный запрос к данными
            .then((result) => {
                return new Promise<DataSet>(
                    (resolve) => setTimeout(() => resolve(result), QUERY_DELAY)
                );
            })
            // Подмешиваем в метаданные настройки конфигурации detail-списка
            .then((result) => {
                const rawData = result.getRawData();
                rawData.meta.listConfiguration = templateConfig;
                result.setRawData(rawData);
                return result;
            });
    }
}

export function getDefaultViewCfg(): IBrowserViewConfig {
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

function getFolderConfig(query?: Query): IBrowserViewConfig {
    const filter = query.getWhere() as {parent: unknown};
    const result = getDefaultViewCfg();

    if (filter.parent == null) {
        result.settings.clientViewMode = DetailViewMode.list;
        return result;
    }

    if (filter.parent === 1) {
        result.settings.clientViewMode = DetailViewMode.tile;
        return result;
    }
}
