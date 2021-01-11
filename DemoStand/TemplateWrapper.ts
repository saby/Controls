import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import { isLoaded, loadAsync } from 'WasabyLoader/ModulesLoader';
import template = require('wml!DemoStand/TemplateWrapper');

interface IDemoTemplateWrapper extends IControlOptions {
    app: string;
}

export default class RootRouterDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected templateLoaded: boolean;

    protected _beforeMount(opts: IDemoTemplateWrapper, context: object, receivedState: void): Promise<void> {
        return new Promise((resolve) => {
            if (receivedState !== undefined) {
                this.templateLoaded = true;
                resolve();
            } else {
                if (isLoaded(opts.app)) {
                    this.templateLoaded = true;
                    resolve();
                } else {
                    loadAsync(opts.app).then(() => {
                        this.templateLoaded = true;
                        resolve();
                    }).catch(() => {
                        this.templateLoaded = false;
                        resolve();
                    });
                }
            }
        });
    }
}
