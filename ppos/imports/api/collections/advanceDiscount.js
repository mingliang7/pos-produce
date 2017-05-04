import  {SelectOpts} from '../../../../acc/imports/ui/libs/select-opts';
export const AdvanceDiscount = new Mongo.Collection('ppos_advanceDiscount');
AdvanceDiscount.schema = new SimpleSchema({
    name: {
        type: String,
        unique: true,
        autoform: {
            type: 'select2',
            options(){
                return [
                    {label: '(Select One)', value: ''},
                    {label: 'Receive Payment', value: 'receivePayment'},
                    {label: 'Pay Bill', value: 'payBill'},
                    {label: 'PO receive payment', value: 'purchaseOrderPayment'},
                    {label: 'SO receive payment', value: 'saleOrderReceivePayment'}
                ]
            }
        }
    },
    advanceDiscount: {
        type: [String],
        optional: true,
        autoform: {
            type: 'select-checkbox',
            multi: true,
            options(){
                return [
                    {label: 'Discount', value: 'discount'},
                    {label: 'COD', value: 'cod'},
                    {label: 'Benefit', value: 'benefit'}
                ]
            }
        }
    }
});
Meteor.startup(function () {
    AdvanceDiscount.schema.i18n("ppos.AdvanceDiscount.schema");
    AdvanceDiscount.attachSchema(AdvanceDiscount.schema);
});
