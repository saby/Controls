import Control = require('Core/Control');
import {cookie} from 'Env/Env';
import template = require('wml!Controls-demo/Async/_asyncDemo/LoadModules');

export default class extends Control {
    protected _template: Function = template;

    protected templateName1: string = 'Controls-demo/Async/testModuleNoLib';
    protected templateName2: string = 'Controls-demo/Async/testLib:testModule';
    protected isOK: string = 'false';

    protected _beforeMount(): void {
        if (typeof window !== 'undefined') {
            if (cookie.get('s3debug') !== 'true') {
                let libModule: boolean = false;
                let noLibModule: boolean = false;
                const scripts = document.querySelectorAll('script');
                for (let i = 0; i < scripts.length; i++) {
                    if (~scripts[i].src.indexOf('testLib')) {
                        libModule = true;
                    }
                    if (~scripts[i].src.indexOf('testModuleNoLib')) {
                        noLibModule = true;
                    }
                }
                if (libModule && noLibModule) {
                    this.isOK = 'true';
                }
            }
        }
    }
}
