import './printSaleOrder.html';

let indexTmpl = Template.pos_printSaleOrder;

indexTmpl.onCreated(function () {
    $(window).keydown(function (e) {
        if (e.keyCode == 8 && e.altKey) {
            FlowRouter.go('/pos/mart-ui');
        }
    });
    this.printData = new ReactiveVar({});
    this.autorun(() => {
        let inv = FlowRouter.query.get('inv');
        if (inv) {
            Meteor.call('printSaleOrder', {invoiceId: inv}, (err, result) => {
                if (result) {
                    this.printData.set(result);
                }
            });
        }
    });
});

indexTmpl.helpers({
    invoiceTypeSaleOrder(invoiceType){
        console.log(invoiceType);
        return invoiceType == 'saleOrder';
    },
    data(){
        let instance = Template.instance();
        let data = instance.printData.get();
        let doc = Session.get('currentUserStockAndAccountMappingDoc');
        data.company = doc.company;
        return data;
    },
    hasPayment(paymentObj){
        console.log(paymentObj);
        return paymentObj && paymentObj.paidAmount > 0;
    },
    lookupRemainQty(sale, itemId){
        if (sale.invoiceType == 'saleOrder') {
            let saleOrderObj = sale.saleOrderDoc.items.find(x => x.itemId == itemId);
            return numeral(saleOrderObj.remainQty).format('0,0.00');
        }
    },
    no(index){
        return index + 1;
    },
    existUnitConvert(unitConvertDoc){
        return !!unitConvertDoc;
    },
    renderBlankTd(sale){
        let concate = '';
        for (let i = sale && sale.saleDetails.length; i < 10; i++) {
            concate += `<tr style="height: 25px;">
                <td align="center">${i + 1}</td>
            <td align="left">
        </td>
            <td align="right"></td>
            <td align="right"></td>
            <td align="right"></td>
            <td align="right"></td>
            <td align="right"></td>
            </tr>`
        }
        return concate;
    }
});
indexTmpl.events({
    'click .printInvoice'(event, instance){
        window.print();
    }
});