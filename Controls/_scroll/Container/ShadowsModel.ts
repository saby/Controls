import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import {POSITION} from './Type';
import ShadowModel from './ShadowModel';
import {IShadowsOptions} from './Interface/IShadows';
import {IScrollState} from "../Utils/ScrollState";


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

    updateScrollState(scrollState: IScrollState): void {
        for (let shadow of Object.keys(this._models)) {
            const isStateChanged = this._models[shadow].updateScrollState(scrollState);
            if (isStateChanged) {
                this._nextVersion();
            }
        }
    }

    setStickyFixed(topFixed: boolean, bottomFixed: boolean): void {
        let isStateChanged = false;
        if (this._models.top) {
            isStateChanged = this._models.top.setStickyFixed(topFixed);
        }
        if (this._models.bottom) {
            isStateChanged = this._models.bottom.setStickyFixed(bottomFixed);
        }
        if (isStateChanged) {
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
