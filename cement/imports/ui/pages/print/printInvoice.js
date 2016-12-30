import './printInvoice.html';

let indexTmpl = Template.pos_printInvoice;

indexTmpl.onCreated(function () {
    $(window).keydown(function (e) {
      if(e.keyCode == 8 && e.altKey) {
            FlowRouter.go('/pos/mart-ui');
        }
    });
    this.printData = new ReactiveVar({});
    this.autorun(() => {
        let inv = FlowRouter.query.get('inv');
        if(inv) {
            Meteor.call('printInvoice', {invoiceId: inv},  (err,result) =>{
                if(result) {
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
        return paymentObj && paymentObj.paidAmount > 0;
    },
    lookupRemainQty(sale, itemId){
        if(sale.invoiceType == 'saleOrder') {
            let saleOrderObj = sale.saleOrderDoc.items.find(x => x.itemId == itemId);
            return numeral(saleOrderObj.remainQty).format('0,0.00');
        }
    },
    no(index){
        return index + 1;
    }
});
indexTmpl.events({
    'click .printInvoice'(event,instance){
        window.print();
    }
});