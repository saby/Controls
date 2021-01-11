import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import { isInit } from 'Application/Initializer';
import { location } from 'Application/Env';
import template = require('wml!DemoStand/Router');

declare const window: Window & {
    reloadDemo?: () => void;
};

interface IDemoRouter extends IControlOptions {
    sourceUrl: string;
    appRoot: string;
}

export default class RootRouterDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected isReloading: boolean = false;

    protected pathName: string = 'index.html';

    protected sourceUrl: string = null;

    protected _options: IDemoRouter;

    reload(): void {
        this.isReloading = true;

        // reloadDemo обновляет содиржимое страницы, окна находятся выше. Очищаем окна вручную.
        requirejs('Controls/popup').Controller.getManager()._popupItems.clear();
        if (requirejs.defined('Controls/popupTemplate')) {
            requirejs('Controls/popupTemplate').StackController._stack.clear();
        }
    }

    reloadDemo(): void {
        this.reload();

        // При обновлении демки сбрасываем все что лежит в settingsController (задается на application);
        window.localStorage.setItem('controlSettingsStorage', '{}');
    }

    _beforeMount(options: IDemoRouter, context: object, receivedState: void | IDemoRouter): Promise<void> {
        const _state = {
            sourceUrl: (receivedState && receivedState.sourceUrl) || options.sourceUrl
        };
        this.sourceUrl = _state.sourceUrl;

        return Promise.resolve();
    }

    _afterMount(): void {
        window.reloadDemo = this.reloadDemo.bind(this);
    }

    _afterUpdate(): void {
        this.isReloading = false;
    }

    _isMenuButtonVisible(): boolean {
        const demoLocation = this._getLocation();

        if (demoLocation) {
            return demoLocation.pathname !== this._options.appRoot + this.pathName;
        }

        return null;
    }

    backClickHdl(): void {
        window.history.back();
    }

    goHomeHandler(): void {
        window.location.replace(this._options.appRoot + this.pathName);
    }

    _getLocation(): typeof location {
        if (isInit()) {
            return location;
        }

        if (typeof window !== 'undefined') {
            return window.location;
        }

        return null;
    }

    static _styles: string[] = ['DemoStand/Router'];
}
