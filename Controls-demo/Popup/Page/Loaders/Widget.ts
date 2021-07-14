export function getConfig({index}): object[] {
    return [{
        id: 'data',
        type: 'custom',
        loadDataMethod: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        key: index,
                        title: 'Widget number ' + index,
                        info: 'This is long info about this widget '.repeat(index + 1)
                    });
                }, 2000);
            });
        },
        dependentArea: ['workspace']
    }];
}
