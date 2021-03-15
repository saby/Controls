import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';

export type Path = null|Model[];

interface IPathResult {
    path: Path;
    pathWithoutItemForBackButton: Path;
    backButtonCaption: string|null;
    backButtonItem: Model;
}

function getPath(data: RecordSet|[]): Path {
    const path = data instanceof RecordSet && data.getMetaData().path;
    let breadCrumbs = null;

    if (path && path.getCount() > 0) {
        breadCrumbs = factory(path).toArray();
    } else if (Array.isArray(data)) {
        breadCrumbs = data;
    }

    return breadCrumbs;
}

function getBackButtonCaption(path: Path, displayProperty?: string): string {
    let caption = '';

    if (path && path.length >= 1 && displayProperty) {
        caption = path[path.length - 1].get(displayProperty);
    }

    return caption;
}

function getBackButtonItem(path: Path): Model {
    let item;

    if (path && path.length >= 1) {
        item = path[path.length - 1];
    }

    return item;
}

function getPathWithoutItemForBackButton(breadCrumbs: Path): Path {
    let breadCrumbsWithoutItemForBackButton = null;

    if (breadCrumbs && breadCrumbs.length > 1) {
        breadCrumbsWithoutItemForBackButton = breadCrumbs.slice(0, breadCrumbs.length - 1);
    }

    return breadCrumbsWithoutItemForBackButton;
}

export default function calculatePath(data: RecordSet, displayProperty?: string): IPathResult {
    const path = getPath(data);

    return {
        path,
        pathWithoutItemForBackButton: getPathWithoutItemForBackButton(path),
        backButtonItem: getBackButtonItem(path),
        backButtonCaption: getBackButtonCaption(path, displayProperty)
    };
}
