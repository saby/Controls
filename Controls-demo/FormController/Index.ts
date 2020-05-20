import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/FormController/FormControllerDemo');
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {ISource} from 'Types/source';
import Env = require('Env/Env');

class FormController extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _dataSource: ISource = null;
    protected idCount =  1;
    protected _key = 0;
    protected _record = null;
    protected _recordAsText = '';
    protected _operation: string = '';

    protected _beforeMount(cfg): void {
       this._dataSource = cfg.dataSource || new Memory({
            keyProperty: 'id',
            data: [{ id: 0}]
        });
    }
    protected  _afterMount(options?: IControlOptions): void {
        this._create({
            initValues: {
                title: 'Title',
                description: 'New note'
            }
        });
    }

    private _create(config): Promise<any> {
        const self = this;
        const initValues = config.initValues;
        const finishDef = this._children.registrator.finishPendingOperations();
        initValues.id = this.idCount;
        const result = new Promise((resolve, reject) => {
        finishDef.then((finishResult) => {
            const createDef = self._children.formControllerInst.create(initValues);
            createDef.then((result) => {
                self.idCount++;
                resolve(true);
                return result;
            }, (error) => {
                Env.IoC.resolve('ILogger').error('FormController example', '', error);
                reject(error);
                return error;
            });
            return finishResult;
        }, (e) => {
            reject(e);
            Env.IoC.resolve('ILogger').error('FormController example', '', e);
            return e;
        });
        });

        result.then((result) => {
            return result;
        }, (error) => {
            return error;
        });
    }

    private _finishPending() {
        const finishDef = this._children.registrator.finishPendingOperations();
        finishDef.then((finishResult) => {
            this._operation = 'Finish Pending';
        });
    }

    private _read(config): Promise<any> {
        const self = this;
        const finishDef = this._children.registrator.finishPendingOperations();
        const result = new Promise((resolve, reject) => {
        finishDef.then((finishResult) => {
            self._key = config.key;
            self._record = null;
            self._forceUpdate();
            resolve(true);
            return finishResult;
        }, (e) => {
            reject(e);
            Env.IoC.resolve('ILogger').error('FormController example', '', e);
            return e;
        });
        });
        result.then((result) => {
            return result;
            },
            (error) => {
            return error;
            });
    }
    private _update(): Promise<any> {
        return this._children.formControllerInst.update();
    }
    private _delete():Promise<any> {
        return this._children.formControllerInst.delete();
    }

    private _clickCreateHandler(): void {
        this._create({
            initValues: {
                title: 'Title',
                description: 'New note'
            }
        });
    }
    private _clickReadHandler(e, id): void {
        this._read({ key: id });
    }
    private _clickUpdateHandler(): void  {
        this._update();
    }
    private _clickDeleteHandler(): void  {
        this._delete();
    }
    getRecordString() {
        if (!this._record) {
            return '';
        }
        if (!this._record.getRawData()) {
            return '';
        }
        return this._record.getRawData();
    }
    private _createSuccessedHandler(e, record) {
        this._operation = 'created successfully';
        this._updateValuesByRecord(record);
    }
    private _updateSuccessedHandler(e, record, key): void {
        this._operation = 'saved successfully';
        this._updateValuesByRecord(record);
    }
    private _updateFailedHandler(): void  {
        this._updateValuesByRecord(this._record);
    }
    private _validationFailedHandler(): void  {
        this._updateValuesByRecord(this._record);
    }
    private _readSuccessedHandler(e, record): void  {
        this._updateValuesByRecord(record);
    }
    private _readFailedHandler(e, err): void  {
        this._updateValuesByRecord(new Model());
    }
    private _deleteSuccessedHandler(e): void  {
        this._operation = 'deleted successfully';
        this._updateValuesByRecord(new Model());
    }
    private _deleteFailedHandler(e): void  {
        this._updateValuesByRecord(new Model());
    }
    private _updateValuesByRecord(record: Model): void {
        this._record = record;

        this._key = this._record.get('id');
        this._recordAsText = this.getRecordString();

        // запросим еще данные прямо из dataSource и обновим dataSourceRecordString
        const def = this._dataSource.read(this._key);
        def.then((record) => {
            if (!record) {
                return '';
            }
            if (!record.getRawData()) {
                return '';
            }
            this.dataSourceRecordString = record.getRawData();
            this._forceUpdate();
        }, (e) => {
            this.dataSourceRecordString = '';
            this._forceUpdate();
            return e;
        });
        this._forceUpdate();
    }
    private _requestCustomUpdate(): boolean {
        return false;
    }
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/FormController/FormControllerDemo'];
}
export default FormController;
