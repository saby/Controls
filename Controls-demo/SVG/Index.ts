import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/SVG/SVG';
import * as getResourceUrl from 'Core/helpers/getResourceUrl';
import Env = require('Env/Env');

export default class extends Control {
    protected _template: TemplateFunction = template;

    private _circleUrl: string = getResourceUrl(`${Env.constants.resourceRoot}Controls-demo/SVG/example.svg#circle`);
}