const SERVICE_FILTERS = {
    HIERARCHY: {
        'Разворот': 'С разворотом',
        'usePages': 'full'
    }
};

function _assignServiceFilters(searchController, filter:object, forced):void {
    if (forced || searchController._options.parentProperty && searchController._viewMode !== 'search' ) {
        Object.assign(filter, SERVICE_FILTERS.HIERARCHY);
    }
}

function _deleteServiceFilters(options, filter:object):void {
    if (options.parentProperty) {
        for (var i in SERVICE_FILTERS.HIERARCHY) {
            if (SERVICE_FILTERS.HIERARCHY.hasOwnProperty(i)) {
                delete filter[i];
            }
        }
    }
}

export {
    _assignServiceFilters,
    _deleteServiceFilters,
}
