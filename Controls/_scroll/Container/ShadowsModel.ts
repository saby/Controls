import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import {POSITION} from './Type';
import ShadowModel from './ShadowModel';
import {IShadowsOptions, IShadowsVisibilityByInnerComponents, SHADOW_VISIBILITY} from './Interface/IShadows';
import {IScrollState} from "../Utils/ScrollState";
import {Offsets} from "./ScrollbarModel";


export default class ShadowsModel extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': true;

    private _models: object = {};

    constructor(options: IShadowsOptions) {
        super(options);

        const scrollMode = options.scrollMode.toLowerCase();
        if (scrollMode.indexOf('vertical') !== -1) {
            this._models.top = new ShadowModel(POSITION.TOP, options);
            this._models.bottom = new ShadowModel(POSITION.BOTTOM, options);
        }
        if (scrollMode.indexOf('horizontal') !== -1) {
            this._models.left = new ShadowModel(POSITION.LEFT, options);
            this._models.right = new ShadowModel(POSITION.RIGHT, options);
        }
    }

    updateOptions(options: IShadowsOptions): void {
        for (let shadow of Object.keys(this._models)) {
            this._models[shadow].updateOptions(options);
        }
    }

    updateScrollState(scrollState: IScrollState, needUpdate: boolean = true): void {
        for (let shadow of Object.keys(this._models)) {
            const isStateChanged = this._models[shadow].updateScrollState(scrollState);
            if (isStateChanged && needUpdate) {
                this._nextVersion();
            }
        }
    }

    updateVisibilityByInnerComponents(shadowsVisibility: IShadowsVisibilityByInnerComponents, needUpdate: boolean = true): void {
        let isChanged: boolean = false;
        for (const shadowPosition of Object.keys(this._models)) {
            const shadowVisibility: SHADOW_VISIBILITY = shadowsVisibility[shadowPosition];
            if (shadowVisibility) {
                isChanged = this._models[shadowPosition].updateVisibilityByInnerComponents(shadowVisibility) || isChanged;
            }
        }
        if (isChanged && needUpdate) {
            this._nextVersion();
        }
    }

    setStickyFixed(topFixed: boolean, bottomFixed: boolean, needUpdate: boolean = true): void {
        let isTopStateChanged = false;
        let isBottomStateChanged = false;
        if (this._models.top) {
            isTopStateChanged = this._models.top.setStickyFixed(topFixed);
        }
        if (this._models.bottom) {
            isBottomStateChanged = this._models.bottom.setStickyFixed(bottomFixed);
        }
        if ((isTopStateChanged || isBottomStateChanged) && needUpdate) {
            this._nextVersion();
        }
    }

    get top(): ShadowModel {
        return this._models.top;
    }
    get bottom(): ShadowModel {
        return this._models.bottom;
    }
    get left(): ShadowModel {
        return this._models.left;
    }
    get right(): ShadowModel {
        return this._models.right;
    }

}
