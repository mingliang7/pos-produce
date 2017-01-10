//components

//collections
import {PurchaseOrder} from '../../api/collections/purchaseOrder.js';
import {PurchaseOrderPayment} from '../../api/collections/purchaseOrderPayment';
import {AdvanceDiscount} from '../../api/collections/advanceDiscount';
import {Vendors} from '../../api/collections/vendor';
//schema
import {purchaseOrderPaymentSchema} from '../../api/collections/purchaseOrderPaymentSchema';
import {displaySuccess, displayError} from '../../../../core/client/libs/display-alert.js';
import {AutoForm} from 'meteor/aldeed:autoform';
import {purchaseOrderPaymentMethod} from '../../../common/methods/purchaseOrderPayment';

//page
import './purchaseOrderPayment.html';
//methods

let indexTmpl = Template.Cement_purchaseOrderPayment;
let currentPaymentDate = new ReactiveVar(moment().toDate());

indexTmpl.onCreated(function () {
    this.autorun(() => {
        Meteor.subscribe('cement.advanceDiscount', {name: 'purchaseOrderPayment'});
        if (Session.get('vendorIdState')) {
            Meteor.subscribe('cement.vendor', {
                _id: Session.get('vendorIdState')
            }, {});
            let vendor = getVendorInfo(Session.get('vendorIdState'));
            billSub = Meteor.subscribe('cement.purchaseOrder', {
                vendorId: Session.get('vendorIdState'),
                paymentStatus: {$in: ['active', 'partial']}
            }, {});
        }
        if (Session.get('invoices')) {
            Meteor.subscribe('cement.purchaseOrderPayment', {
                billId: {
                    $in: Session.get('invoices')
                },
                status: {$in: ['active', 'partial']}
            });
        }
    });
    Session.set('amountDue', 0);
    Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0, billId: ''});
    Session.set('disableTerm', false);
    Session.set('enterBillsObjCount', 0);
    if (FlowRouter.getParam('billId')) {
        Session.set('billId', FlowRouter.getParam('billId'));
    } else {
        Session.set('billId', 0);
    }
    Session.set('enterBillsObj', {
        count: 0
    });
    Session.set('balance', 0)
});
indexTmpl.onRendered(function () {
    paymentDate($('[name="paymentDate"]'));
});
indexTmpl.onDestroyed(function () {
    Session.set('vendorIdState', undefined);
    Session.set('invoices', undefined);
    Session.set('disableTerm', false);
    Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0, billId: ''});
    Session.set('amountDue', 0);
    Session.set('billId', 0);
    Session.set('enterBillsObj', {
        count: 0
    });
    Session.set('balance', 0)
});
indexTmpl.rendered = function () {
    Session.set('vendorIdState', FlowRouter.getParam('vendorId'));
};
indexTmpl.helpers({
    discount(){
        return checkTerm(this);
    },
    term(){
        try {

            return getVendorTerm(Session.get('vendorIdState'));

        } catch (e) {

        }

    },
    countIsqualSales() {
        let enterBillsObj = Session.get('enterBillsObj');
        let vendor = Vendors.findOne(Session.get('vendorIdState'));
        let collection = PurchaseOrder.find({});
        if (collection.count() != 0 && enterBillsObj.count == collection.count()) {
            return true;
        }
        return false;
    },
    doc() {
        return {
            vendorId: FlowRouter.getParam('vendorId')
        }
    },
    dueAmount(){
        let total = this.total || 0;
        let lastPayment = getLastPayment(this._id);
        console.log(lastPayment);
        return lastPayment == 0 ? `${numeral(total).format('0,0.00')}` : `${numeral(lastPayment).format('0,0.00')}`;
    },
    schema() {
        return purchaseOrderPaymentSchema;
    },
    invoices() {
        let invoices;
        let vendor = getVendorInfo(Session.get('vendorIdState'));
        if (vendor) {
            invoices = PurchaseOrder.find({}, {
                sort: {
                    _id: 1
                }
            });
        }
        if (invoices.count() > 0) {
            let arr = [];
            invoices.forEach(function (invoice) {
                let lastPayment = getLastPayment(invoice._id);
                arr.push(invoice._id);
                invoice.dueAmount = lastPayment == 0 ? invoice.total : lastPayment;
            });
            Session.set('invoices', arr);
            return invoices;
        }
        return false;
    },
    hasAmount() {
        try {
            let _id = Session.get('billId');
            let discount = this.status == 'active' ? checkTerm(this) : 0;
            let lastPayment = getLastPayment(this._id);
            let currentSelectDate = currentPaymentDate.get();
            let lastPaymentDate = getLastPaymentDate(_id);
            if (this.status == 'active' && (this._id == _id || this.voucherId == _id)) { //match _id with status active
                let saleInvoices = {
                    count: 0
                };
                saleInvoices.count += 1;
                let valueAfterDiscount = this.total * (1 - (discount / 100));
                this.receivedPay = valueAfterDiscount;
                this.discount = discount;
                saleInvoices[this._id] = this;
                saleInvoices[this._id].dueAmount = lastPayment == 0 ? valueAfterDiscount : lastPayment;
                Session.set('enterBillsObj', saleInvoices);
                return true;
            }
            if (this.status == 'partial' && (this._id == _id || this.voucherId == _id)) { //match _id with status partial
                if (!lastPaymentDate || (lastPaymentDate && moment(currentSelectDate).isAfter(lastPaymentDate))) {

                    let saleInvoices = {
                        count: 0
                    };
                    saleInvoices.count += 1;
                    this.receivedPay = lastPayment;
                    this.discount = 0;
                    saleInvoices[this._id] = this;
                    saleInvoices[this._id].dueAmount = lastPayment == 0 ? this.total : lastPayment;
                    Session.set('enterBillsObj', saleInvoices);
                    return true;
                } else {
                    swal(
                        'ច្រានចោល!',
                        `វិក័យប័ត្រលេខ #${_id} បានបង់ប្រាក់ថ្ងៃចុងក្រោយ ${moment(lastPaymentDate).format('YYYY-MM-DD HH:mm:ss')} ប៉ុន្តែអ្នកបានជ្រើសរើសថ្ងៃទី ${moment(currentSelectDate).format('YYYY-MM-DD HH:mm:ss')}`,
                        'error'
                    );
                    return false;
                }
            }
            return false;
        } catch (e) {
        }
    },
    isLastPaymentDateGreaterThanCurrentSelectDate(){
        let lastPaymentDate = getLastPaymentDate(this._id);
        let currentSelectDate = currentPaymentDate.get();
        if (lastPaymentDate) {
            if (moment(currentSelectDate).isBefore(lastPaymentDate)) {
                return `<input type="checkbox" name="name" class="select-invoice" disabled>`;
            } else {
                return `<input type="checkbox" name="name" class="select-invoice">`;
            }
        }
        return `<input type="checkbox" name="name" class="select-invoice">`;
    },
    disableInputIfLastPaymentDateGreaterThanCurrentSelectDateOrPaidSome(){
        let lastPaymentDate = getLastPaymentDate(this._id);
        let currentSelectDate = currentPaymentDate.get();
        let advanceDiscountCollection = AdvanceDiscount.findOne({name: 'purchaseOrderPayment'});
        let notContainAdvanceDiscount = !_.includes(advanceDiscountCollection && advanceDiscountCollection.advanceDiscount, 'discount');
        let lastPayment = getLastPayment(this._id);
        if (lastPaymentDate) {
            if (moment(currentSelectDate).isBefore(lastPaymentDate) || lastPayment > 0 || notContainAdvanceDiscount) {
                return true;
            } else {
                return false;
            }
        } else if (notContainAdvanceDiscount) {
            return true;
        }
        return false;
    },
    disableInputIfLastPaymentDateGreaterThanCurrentSelectDateOrPaidSomeOrNotContainCod(){
        let lastPaymentDate = getLastPaymentDate(this._id);
        let lastPayment = getLastPayment(this._id);
        let currentSelectDate = currentPaymentDate.get();
        let advanceDiscountCollection = AdvanceDiscount.findOne({name: 'purchaseOrderPayment'});
        let notContainAdvanceDiscount = !_.includes(advanceDiscountCollection && advanceDiscountCollection.advanceDiscount, 'cod');
        if (lastPaymentDate) {
            if (moment(currentSelectDate).isBefore(lastPaymentDate) || lastPayment > 0 || notContainAdvanceDiscount) {
                return true;
            } else {
                return false;
            }
        } else if (notContainAdvanceDiscount) {
            return true;
        }
        return false;
    },
    disableInputIfLastPaymentDateGreaterThanCurrentSelectDateOrPaidSomeOrNotContainBenefit(){
        let lastPaymentDate = getLastPaymentDate(this._id);
        let lastPayment = getLastPayment(this._id);
        let currentSelectDate = currentPaymentDate.get();
        let advanceDiscountCollection = AdvanceDiscount.findOne({name: 'purchaseOrderPayment'});
        let notContainAdvanceDiscount = !_.includes(advanceDiscountCollection && advanceDiscountCollection.advanceDiscount, 'benefit');
        if (lastPaymentDate) {
            if (moment(currentSelectDate).isBefore(lastPaymentDate) || lastPayment > 0 || notContainAdvanceDiscount) {
                return true;
            } else {
                return false;
            }
        } else if (notContainAdvanceDiscount) {
            return true;
        }
        return false;
    },
    disableInputIfLastPaymentDateGreaterThanCurrentSelectDate(){
        let lastPaymentDate = getLastPaymentDate(this._id);
        let currentSelectDate = currentPaymentDate.get();
        if (lastPaymentDate) {
            if (moment(currentSelectDate).isBefore(lastPaymentDate)) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    },
    totalPaid(){
        let totalPaid = 0;
        let enterBillsObjObj = Session.get('enterBillsObj');
        delete enterBillsObjObj.count;

        if (_.isEmpty(enterBillsObjObj)) {
            return 0;
        } else {
            for (let k in enterBillsObjObj) {
                totalPaid += enterBillsObjObj[k].receivedPay
            }
            return totalPaid;
        }
    },
    totalAmountDue(){
        let totalAmountDue = 0;
        let vendor = getVendorInfo(Session.get('vendorIdState'));
        let invoices = PurchaseOrder.find({});
        if (invoices.count() > 0) {
            invoices.forEach(function (invoice) {
                let receivePayments = PurchaseOrderPayment.find({billId: invoice._id}, {
                    sort: {
                        _id: 1,
                        paymentDate: 1
                    }
                });
                if (receivePayments.count() > 0) {
                    let lastPayment = _.last(receivePayments.fetch());
                    totalAmountDue += lastPayment.balanceAmount;
                } else {
                    totalAmountDue += invoice.total;
                }
            });
        }
        Session.set('balance', numeral(totalAmountDue).format('0,0.00'));
        return totalAmountDue;
    },
    totalActualPay(){
        let totalAmountDue = 0;
        let vendor = getVendorInfo(Session.get('vendorIdState'));
        let invoices = PurchaseOrder.find({});
        if (invoices.count() > 0) {
            invoices.forEach(function (invoice) {
                let discount = invoice.status == 'active' ? checkTerm(invoice) : 0;
                let receivePayments = PurchaseOrderPayment.find({billId: invoice._id}, {
                    sort: {
                        _id: 1,
                        paymentDate: 1
                    }
                });
                if (receivePayments.count() > 0) {
                    let lastPayment = _.last(receivePayments.fetch());
                    totalAmountDue += lastPayment.balanceAmount;
                } else {
                    totalAmountDue += invoice.total * (1 - (discount / 100));
                }
            });
        }
        Session.set('balance', numeral(totalAmountDue).format('0,0.00'));
        return totalAmountDue;
    },
    totalOriginAmount(){
        let totalOrigin = 0;
        let vendor = getVendorInfo(Session.get('vendorIdState'));
        let collection = PurchaseOrder.find({});
        collection.forEach(function (invoices) {
            totalOrigin += invoices.total;
        });
        return totalOrigin;
    },
    vendorBalance(){
        return Session.get('balance');
    },
    total(){
        let discount = this.status == 'active' ? checkTerm(this) : 0;
        let valueAfterDiscount = this.total * (1 - (discount / 100));
        let lastPayment = getLastPayment(this._id);
        return lastPayment == 0 ? numeral(valueAfterDiscount).format('0,0.00') : numeral(lastPayment).format('0,0.00');
    },
    originAmount(){
        return numeral(this.total).format('0,0.00');
    },
    isInvoiceDate(){
        if (this.invoiceDate) {
            return moment(this.invoiceDate).format('YYYY-MM-DD HH:mm:ss');
        } else {
            let startDate = moment(this.startDate).format('YYYY-MM-DD');
            let endDate = moment(this.endDate).format('YYYY-MM-DD');
            return `${startDate} to ${endDate}`;
        }
    },
    lastPaymentDate(){
        let lastPaymentDate = getLastPaymentDate(this._id);
        if (lastPaymentDate) {
            return `<br><span class="label label-success"><i class="fa fa-money"></i> Last Paid: ${moment(lastPaymentDate).format('YYYY-MM-DD HH:mm:ss')}</span>`;
        }
        return '';
    },
    defaultDate(){
        return moment().toDate();
    }
});

indexTmpl.events({
    'change .disable-term'(event, instance){
        if ($(event.currentTarget).prop('checked')) {
            Session.set('disableTerm', true);
            Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0})
        } else {
            getVendorTerm(Session.get('vendorIdState'));
        }
    },
    'change [name="vendorId"]' (event, instance) {
        if (event.currentTarget.value != '') {
            clearChecbox();
            Session.set('vendorIdState', event.currentTarget.value.trim());
        }
    },
    'change [name="billId"]' (event, instance) {
        clearChecbox();
        if (event.currentTarget.value != '') {
            Session.set('billId', event.currentTarget.value)
        }
    },
    'click .select-invoice' (event, instance) {
        let selectedInvoices = Session.get('enterBillsObj');
        let lastPayment = getLastPayment(this._id);
        let discount = $(event.currentTarget).parents('invoice-parents').find('.discount').val();
        if ($(event.currentTarget).prop('checked')) {
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(lastPayment == 0 ? this.total : lastPayment).change();

        } else {
            delete selectedInvoices[this._id];
            selectedInvoices.count -= 1;
            $(event.currentTarget).parents('.invoice-parents').find('.total').val('');
            Session.set('enterBillsObj', selectedInvoices);
        }
    },
    'click .select-all' (event, instance) {
        clearChecbox();
        if ($(event.currentTarget).prop('checked')) {
            let saleObj = Session.get('enterBillsObj');
            let total = [];
            let index = 0;
            let currentSelectDate = currentPaymentDate.get();
            let vendor = getVendorInfo(Session.get('vendorIdState'));
            let enterBillsObj;
            if (vendor) {
                enterBillsObj = PurchaseOrder.find({}, {
                    sort: {
                        _id: 1
                    }
                });
            }
            enterBillsObj.forEach((sale) => {
                let lastPaymentDate = getLastPaymentDate(sale._id);
                //check if current select date is not smaller than last paymentDate
                if (!lastPaymentDate || (lastPaymentDate && moment(currentSelectDate).isAfter(lastPaymentDate))) {
                    let lastPayment = getLastPayment(sale._id);
                    sale.dueAmount = lastPayment == 0 ? sale.total : lastPayment;
                    sale.receivedPay = lastPayment == 0 ? sale.total : lastPayment; //receive amount of pay
                    saleObj[sale._id] = sale;
                    total.push(sale.dueAmount);
                }
            });
            saleObj.count = enterBillsObj.count();
            Session.set('enterBillsObj', saleObj);
            $('.select-invoice').each(function () {
                if (!$(this).prop('disabled')) {
                    $(this).prop('checked', true);
                    $(this).parents('.invoice-parents').find('.total').val(total[index]).change()
                    index++;
                }
            })
        } else {
            clearChecbox()
        }
    },
    'change .discount'(event, instance){
        let total = this.total;
        let discount = 0;
        let cod = $(event.currentTarget).parents('.invoice-parents').find('.cod').val();
        let benefit = $(event.currentTarget).parents('.invoice-parents').find('.benefit').val();
        cod = cod == "" ? 0 : parseFloat(cod);
        benefit = benefit == "" ? 0 : parseFloat(benefit);
        if (event.currentTarget.value == '') {
            //trigger change on total+
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(total - (cod + benefit) ).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(total - (cod + benefit) ).format('0,0.00')).change();
            $(event.currentTarget).val('0');

        } else {
            //trigger change on total
            let valueAfterDiscount = (total - (cod + benefit + parseFloat(event.currentTarget.value)) ) ;
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(valueAfterDiscount).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(valueAfterDiscount).format('0,0.00')).change();
        }
    },
    'change .cod'(event, instance){
        let total = this.total;
        let cod = 0;
        let discount = $(event.currentTarget).parents('.invoice-parents').find('.discount').val();
        let benefit = $(event.currentTarget).parents('.invoice-parents').find('.benefit').val();
        discount = discount == "" ? 0 : parseFloat(discount);
        benefit = benefit == "" ? 0 : parseFloat(benefit);
        if (event.currentTarget.value == '') {
            //trigger change on total+
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(total - (discount + benefit) ).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(total - (discount + benefit)).format('0,0.00')).change();
            $(event.currentTarget).val('0');

        } else {
            //trigger change on total
            let valueAfterCod = (total - (discount + benefit + parseFloat(event.currentTarget.value)));
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(valueAfterCod).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(valueAfterCod).format('0,0.00')).change();
        }
    },
    'change .benefit'(event, instance){
        let total = this.total;
        let benefit = 0;
        let discount = $(event.currentTarget).parents('.invoice-parents').find('.discount').val();
        let cod = $(event.currentTarget).parents('.invoice-parents').find('.cod').val();
        discount = discount == "" ? 0 : parseFloat(discount);
        cod = cod == "" ? 0 : parseFloat(cod);
        if (event.currentTarget.value == '') {
            //trigger change on total+
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(total-(discount+cod) ).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(total-(discount+cod) ).format('0,0.00')).change();
            $(event.currentTarget).val('0');

        } else {
            //trigger change on total
            let valueAfterbenefit = (total - (discount + cod + parseFloat(event.currentTarget.value))) ;
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(valueAfterbenefit).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(valueAfterbenefit).format('0,0.00')).change();
        }
    },
    "keypress .discount,.cod,.benefit" (evt) {
        let charCode = (evt.which) ? evt.which : evt.keyCode;
        if ($(evt.currentTarget).val().indexOf('.') != -1) {
            if (charCode == 46) {
                return false;
            }
        }
        return !(charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57));
    },
    'change .total' (event, instance) {
        let selectedInvoices = Session.get('enterBillsObj');
        let lastPayment = getLastPayment(this._id);
        let discount = $(event.currentTarget).parents('.invoice-parents').find('.discount').val(); // get discount
        let cod = $(event.currentTarget).parents('.invoice-parents').find('.cod').val(); // get discount
        let benefit = $(event.currentTarget).parents('.invoice-parents').find('.benefit').val(); // get discount
        if (event.currentTarget.value == '' || event.currentTarget.value == '0') {
            if (_.has(selectedInvoices, this._id)) {
                selectedInvoices.count -= 1;
                delete selectedInvoices[this._id];
                Session.set('enterBillsObj', selectedInvoices);
                $(event.currentTarget).val('');
                $(event.currentTarget).parents('.invoice-parents').find('.select-invoice').prop('checked', false);
            }
        } else {
            if (!_.has(selectedInvoices, this._id)) {
                selectedInvoices.count += 1;
            }
            selectedInvoices[this._id] = this;
            selectedInvoices[this._id].discount = parseFloat(discount);
            selectedInvoices[this._id].cod = parseFloat(cod);
            selectedInvoices[this._id].benefit = parseFloat(benefit);
            selectedInvoices[this._id].receivedPay = parseFloat(event.currentTarget.value);
            selectedInvoices[this._id].dueAmount = lastPayment == 0 ? this.total - discount : lastPayment;
            selectedInvoices[this._id].dueAmount = lastPayment == 0 ? selectedInvoices[this._id].dueAmount - cod : selectedInvoices[this._id].dueAmount;
            selectedInvoices[this._id].dueAmount = lastPayment == 0 ? selectedInvoices[this._id].dueAmount - benefit : selectedInvoices[this._id].dueAmount;
            $(event.currentTarget).parents('.invoice-parents').find('.select-invoice').prop('checked', true);
            if (parseFloat(event.currentTarget.value) > selectedInvoices[this._id].dueAmount) { //check if entering payment greater than dueamount
                selectedInvoices[this._id].receivedPay = selectedInvoices[this._id].dueAmount;
                $(event.currentTarget).parents('.invoice-parents').find('.total').val(selectedInvoices[this._id].dueAmount);
            }
            Session.set('enterBillsObj', selectedInvoices);
            $(event.currentTarget).val(numeral(event.currentTarget.value).format('0,0.00'));
        }
    },
    "keypress .total" (evt) {
        let charCode = (evt.which) ? evt.which : evt.keyCode;
        if ($(evt.currentTarget).val().indexOf('.') != -1) {
            if (charCode == 46) {
                return false;
            }
        }
        return !(charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57));
    }
});

//functions
function clearChecbox() {
    Session.set('billId', 0); //clear checkbox
    Session.set('disableTerm', false);
    Session.set('billId', '');
    Session.set('enterBillsObj', {
        count: 0
    }); //set obj to empty on keychange

    $(".disable-term").prop('checked', false);
    $(".select-invoice").each(function () {
        $(this).prop('checked', false);
        $(this).parents('.invoice-parents').find('.total').val('');
    })
}
function getLastPayment(billId) {
    let receivePayments = PurchaseOrderPayment.find({billId: billId}, {sort: {_id: 1, paymentDate: 1}});
    if (receivePayments.count() > 0) {
        let lastPayment = _.last(receivePayments.fetch());
        return lastPayment.balanceAmount;
    }
    return 0;
}
function getLastPaymentDate(billId) {
    let receivePayments = PurchaseOrderPayment.find({billId: billId}, {sort: {_id: 1, paymentDate: 1}});
    if (receivePayments.count() > 0) {
        let lastPayment = _.last(receivePayments.fetch());
        return lastPayment.paymentDate;
    }
    return 0;
}
function checkTerm(self) {
    if (self.status == 'active') {
        let term = Session.get('discount');
        let invoiceDate = self.invoiceDate;
        let dueDate = moment(invoiceDate).add(`${term.discountIfPaidWithin}`, 'days');
        term.invoiceDate = invoiceDate;
        term.dueDate = dueDate;
        if (term.discountIfPaidWithin == 0) {
            return 0;
        }
        if (moment(term.invoiceDate).isSameOrBefore(term.dueDate, 'day')) {
            return term.discountPercentages;
        }
    }
    return 0;

}
function getVendorTerm(vendorId) {
    let vendor = getVendorInfo(vendorId);
    if (vendor) {
        // Meteor.call('getTerm', vendor.termId, function (err, result) {
        //     Session.set('discount', {
        //         termName: result.name,
        //         discountIfPaidWithin: result.discountIfPaidWithin,
        //         discountPercentages: result.discountPercentages
        //     });
        // });
        // return `Term: ${vendor._term.name}`;
        return ''
    } else {
        Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0, billId: ''});
        return 0;

    }
    return false;
}
function getVendorInfo(id) {
    return Vendors.findOne(id);
}
//autoform hook
let hooksObject = {
    onSubmit(){
        this.event.preventDefault();
        let enterBillsObj = Session.get('enterBillsObj');
        let branch = Session.get('currentBranch');
        delete enterBillsObj.count;
        if (_.isEmpty(enterBillsObj)) {
            swal({
                title: "Warning",
                text: "Your payments can't be blank",
                type: "error",
                confirmButtonClass: "btn-danger",
                showConfirmButton: true,
                timer: 3000
            });
        } else {
            let paymentDate = this.insertDoc.paymentDate || new Date();
            let voucherId = this.insertDoc.voucherId || '';
            swal({
                title: "Processing Payment..",
                text: "Click OK to continue!",
                type: "info",
                showCancelButton: true,
                closeOnConfirm: false,
                showLoaderOnConfirm: true,
            }).then(function () {
                purchaseOrderPaymentMethod.callPromise({paymentDate, enterBillsObj, branch, voucherId})
                    .then(function (result) {
                        clearChecbox();
                        swal({
                            title: "Pay Bill",
                            text: "Successfully paid!",
                            type: "success",
                            confirmButtonClass: "btn-success",
                            showConfirmButton: true,
                            timer: 3000
                        });
                    })
                    .catch(function (err) {
                        Session.set('enterBillsObj', {count: 0});
                        swal({
                            title: "[Error]",
                            text: err.message,
                            type: "error",
                            confirmButtonClass: "btn-danger",
                            showConfirmButton: true,
                            timer: 3000
                        });
                    })
            });

        }
        return false;
    },
};
function paymentDate(element) {
    element.on("dp.change", (e) => {
        clearChecbox();
        currentPaymentDate.set(e.date.toDate());
    });
}
AutoForm.addHooks([
    'Cement_purchaseOrderPayment'
], hooksObject);
