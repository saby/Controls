import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import template = require('wml!DemoStand/ContainerTheme');

/**
 * This control trying to get theme option from url and pass it to demo
 */
export default class ContainerTheme extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
