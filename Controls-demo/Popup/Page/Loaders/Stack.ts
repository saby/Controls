export function getConfig(): object[] {
    return [
        {
            id: 'data',
            type: 'custom',
            loadDataMethod: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            key: 'key',
                            count: 100500,
                            date: new Date(),
                            widgetsCountAtStart: 15,
                            info: 'This is long info about this dialog '.repeat(10)
                        });
                    }, 2000);
                });
            },
            dependentArea: ['workspace']
        },
        {
            id: 'widgets',
            type: 'additionalDependencies',
            dependencies: ['data'],
            loadDataMethod: (cfg, deps) => {
                const keys = [];
                for (let i = 0; i < deps[0].widgetsCountAtStart; i++) {
                    keys.push(`widget${i}`);
                }
                return Promise.resolve(keys);
            },
            dependentArea: ['workspace']
        }
    ];
}
