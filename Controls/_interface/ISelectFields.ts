import {QuerySelectExpression} from 'Types/source';

export interface ISelectFieldsOptions {
    selectFields?: QuerySelectExpression;
}
/**
 * Интерфейс для контролов, поддерживающих выборку по именам полей.
 * @public
 * @author Герасимов А.М.
 */
export default interface ISelectFields {
    readonly '[Controls/_interface/ISelectFields]': boolean;
}

/**
 * @name Controls/_interface/ISelectFields#selectFields
 * @cfg {Array} Устанавливает имена полей для выбора.
 * @example
 * Выберем магазинные заказы с определенным набором полей.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View selectField="{{['id', 'date', 'customerId']}}"/>
 * </pre>
 * @link Types/_source/Query/Join#select
 */
