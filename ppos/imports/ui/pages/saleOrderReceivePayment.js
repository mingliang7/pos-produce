//components
import {createNewAlertify} from '../../../../core/client/libs/create-new-alertify.js';
import {renderTemplate} from '../../../../core/client/libs/render-template.js';
//collections
import {Order} from '../../api/collections/order';
import {SaleOrderReceivePayment} from '../../api/collections/saleOrderReceivePayment';
import {AdvanceDiscount} from '../../api/collections/advanceDiscount';
import {Customers} from '../../api/collections/customer';
//schema
import {saleOrderReceivePaymentSchema} from '../../api/collections/saleOrderReceivePaymentSchema.js';
import {displaySuccess, displayError} from '../../../../core/client/libs/display-alert.js';
import {AutoForm} from 'meteor/aldeed:autoform';
import {saleOrderReceivePayment} from '../../../common/methods/saleOrderReceivePayment';
//page
import './saleOrderReceivePayment.html';
import './penalty.html';
//libs
import RangeDate from '../../api/libs/date';
let countLateInvoice = new ReactiveVar(0);
let currentPaymentDate = new ReactiveVar(moment().toDate());
let isPenalty = new ReactiveVar(true);
let indexTmpl = Template.PPOS_saleOrderReceivePayment;


indexTmpl.onRendered(function () {
    RangeDate.checkMinPlusOneDay($('[name="paymentDate"]'));
    paymentDate($('[name="paymentDate"]'));
});

indexTmpl.onCreated(function () {
    createNewAlertify('penalty');
    Session.set('amountDue', 0);
    Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0, invoiceId: ''});
    Session.get('disableTerm', false);
    Session.set('invoicesObjCount', 0);
    if (FlowRouter.getParam('invoiceId')) {
        Session.set('invoiceId', FlowRouter.getParam('invoiceId'));
    } else {
        Session.set('invoiceId', 0);
    }
    Session.set('invoicesObj', {
        count: 0
    });
    Session.set('balance', 0)
    this.autorun(() => {
        Meteor.subscribe('ppos.advanceDiscount', {name: 'saleOrderReceivePayment'});
        if (Session.get('customerId')) {
            Meteor.subscribe('ppos.customer', {
                _id: Session.get('customerId')
            });
            let customer = getCustomerInfo(Session.get('customerId'));
            let invoiceSub;
            invoiceSub = Meteor.subscribe('ppos.activeOrders', {
                customerId: Session.get('customerId'),
                paymentStatus: {$in: ['active', 'partial']},
            });
            if (invoiceSub.ready()) {
                let invoices = customer.termId ? Order.find({}).fetch() : Order.find({}).fetch();
                Meteor.call('calculateLateInvoice', {invoices}, function (err, result) {
                    countLateInvoice.set(result);
                });
            }
        }
        if (Session.get('createPenalty')) {
            let customer = getCustomerInfo(Session.get('customerId'));
            let invoices = customer.termId ? Order.find({}).fetch() : Order.find({}).fetch();
            Meteor.call('calculateLateInvoice', {invoices}, function (err, result) {
                countLateInvoice.set(result);
            });
        }
        if (Session.get('invoices')) {
            Meteor.subscribe('ppos.saleOrderReceivePayment', {
                invoiceId: {
                    $in: Session.get('invoices')
                },
                status: {$in: ['active', 'partial']}
            });
        }
    });
});
indexTmpl.onDestroyed(function () {
    Session.set('customerId', undefined);
    Session.set('invoices', undefined);
    Session.get('disableTerm', false);
    Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0, invoiceId: ''});
    Session.set('amountDue', 0);
    Session.set('invoiceId', 0);
    Session.set('invoicesObj', {
        count: 0
    });
    Session.set('balance', 0)
});
indexTmpl.rendered = function () {
    Session.set('customerId', FlowRouter.getParam('customerId'));
};
indexTmpl.helpers({
    getPenalty(_id){
        try {
            let invoice = countLateInvoice.get();
            let penalty = invoice.calculatePenalty[_id] || 0;
            return (_.isEmpty(invoice.calculatePenalty) || !isPenalty.get()) ? 0 : numeral(penalty).format('0,0.00');
        } catch (e) {
        }
    },
    checkLate(_id){
        let invoice = countLateInvoice.get();
        return _.includes(invoice.lateOrder, _id) && isPenalty.get() ? '<b class="text-red"><i class="fa fa-exclamation-circle"></i></b> ' : '';
    },
    countLateInvoice(){
        let createOne = countLateInvoice.get().count > 0 ? ", Penalty is not exist. <a class='cursor-pointer create-penalty'>Create Penalty <i class='fa fa-pencil-square-o'></i></a>" : '';
        if (isPenalty.get()) {
            return countLateInvoice.get().penaltyNotExist ? `<span class="text-green">${countLateInvoice.get().count}</span>` + ` ${createOne}` : countLateInvoice.get().count;
        }
        return 0;
    },
    discount(){
        return checkTerm(this);
    },
    term(){
        try {

            return getCustomerTerm(Session.get('customerId'));

        } catch (e) {

        }

    },
    countIsqualSales() {
        let invoicesObj = Session.get('invoicesObj');
        let customer = Customers.findOne(Session.get('customerId'));
        let collection = (customer && customer.termId) ? Order.find() : Order.find();
        if (collection.count() != 0 && invoicesObj.count == collection.count()) {
            return true;
        }
        return false;
    },
    doc() {
        return {
            customerId: FlowRouter.getParam('customerId')
        }
    },
    dueAmount(){
        let total = this.total || 0;
        let lastPayment = getLastPayment(this._id);
        return lastPayment == 0 ? `${numeral(total).format('0,0.00')}` : `${numeral(lastPayment).format('0,0.00')}`;
    },
    schema() {
        return saleOrderReceivePaymentSchema;
    },
    invoices() {
        let invoices;
        let customer = getCustomerInfo(Session.get('customerId'));
        if (customer && customer.termId) {
            invoices = Order.find({}, {
                sort: {
                    _id: 1
                }
            });
        } else {
            invoices = Order.find({}, {sort: {_id: 1}});
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
    lastPaymentDate(){
        let lastPaymentDate = getLastPaymentDate(this._id);
        if (lastPaymentDate) {
            return `<br><span class="label label-success"><i class="fa fa-money"></i> Last Paid: ${moment(lastPaymentDate).format('YYYY-MM-DD HH:mm:ss')}</span>`;
        }
        return '';
    },
    hasAmount() {
        try {
            let _id = Session.get('invoiceId');
            let discount = this.paymentStatus == 'active' ? checkTerm(this) : 0;
            let lastPayment = getLastPayment(this._id);
            let currentSelectDate = currentPaymentDate.get();
            let lastPaymentDate = getLastPaymentDate(_id);
            if (this.paymentStatus == 'active' && (this._id == _id || this.voucherId == _id)) { //match _id with status active
                let saleOrder = {
                    count: 0
                };
                saleOrder.count += 1;
                let valueAfterDiscount = this.total * (1 - (discount / 100));
                this.receivedPay = valueAfterDiscount;
                this.discount = discount;
                saleOrder[this._id] = this;
                saleOrder[this._id].penalty = isPenalty.get() ? (countLateInvoice.get().calculatePenalty[this._id] || 0) : 0;
                saleOrder[this._id].dueAmount = lastPayment == 0 ? valueAfterDiscount : lastPayment;
                Session.set('invoicesObj', saleOrder);
                return true;

            }
            if (this.paymentStatus == 'partial' && (this._id == _id || this.voucherId == _id)) { //match _id with status partial
                if (!lastPaymentDate || (lastPaymentDate && moment(currentSelectDate).isAfter(lastPaymentDate))) {
                    let saleOrder = {
                        count: 0
                    };
                    saleOrder.count += 1;
                    this.receivedPay = lastPayment;
                    this.discount = 0;
                    saleOrder[this._id] = this;
                    saleOrder[this._id].penalty = isPenalty.get() ? (countLateInvoice.get().calculatePenalty[this._id] || 0) : 0;
                    saleOrder[this._id].dueAmount = lastPayment == 0 ? this.total : lastPayment;
                    Session.set('invoicesObj', saleOrder);
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
    totalPaid(){
        let totalPaid = 0;
        let invoicesObjObj = Session.get('invoicesObj');
        delete invoicesObjObj.count;
        if (_.isEmpty(invoicesObjObj)) {
            return 0;
        } else {
            for (let k in invoicesObjObj) {
                totalPaid += invoicesObjObj[k].receivedPay + invoicesObjObj[k].penalty
            }
            return totalPaid;
        }
    },
    totalAmountDue(){
        let totalAmountDue = 0;
        let customer = getCustomerInfo(Session.get('customerId'));
        let invoices = (customer && customer.termId) ? Order.find({}) : Order.find({});
        if (invoices.count() > 0) {
            invoices.forEach(function (invoice) {
                let saleOrderReceivePayments = SaleOrderReceivePayment.find({invoiceId: invoice._id}, {
                    sort: {
                        _id: 1,
                        paymentDate: 1
                    }
                });
                if (saleOrderReceivePayments.count() > 0) {
                    let lastPayment = _.last(saleOrderReceivePayments.fetch());
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
        let customer = getCustomerInfo(Session.get('customerId'));
        let invoices = (customer && customer.termId) ? Order.find({}) : Order.find({});
        if (invoices.count() > 0) {
            invoices.forEach(function (invoice) {
                let discount = invoice.paymentStatus == 'active' ? checkTerm(invoice) : 0;
                let saleOrderReceivePayments = SaleOrderReceivePayment.find({invoiceId: invoice._id}, {
                    sort: {
                        _id: 1,
                        paymentDate: 1
                    }
                });
                if (saleOrderReceivePayments.count() > 0) {
                    let lastPayment = _.last(saleOrderReceivePayments.fetch());
                    totalAmountDue += lastPayment.balanceAmount;
                } else {
                    totalAmountDue += invoice.total * (1 - (discount / 100));
                }
            });
        }
        Session.set('balance', numeral(totalAmountDue).format('0,0.00'));
        console.log(totalAmountDue);
        return totalAmountDue;
    },
    totalOriginAmount(){
        let totalOrigin = 0;
        let customer = getCustomerInfo(Session.get('customerId'));
        let collection = (customer && customer.termId) ? Order.find({}) : Order.find({});
        collection.forEach(function (invoices) {
            totalOrigin += invoices.total;
        });
        return totalOrigin;
    },
    customerBalance(){
        return Session.get('balance');
    },
    total(){
        try {
            let discount = this.paymentStatus == 'active' ? checkTerm(this) : 0;
            let penalty = isPenalty.get() ? countLateInvoice.get().calculatePenalty[this._id] || 0 : 0;
            let valueAfterDiscount = this.total * (1 - (discount / 100));
            let lastPayment = getLastPayment(this._id);
            return lastPayment == 0 ? numeral(valueAfterDiscount + penalty).format('0,0.00') : numeral(lastPayment + penalty).format('0,0.00');
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
        let lastPayment = getLastPayment(this._id);
        let currentSelectDate = currentPaymentDate.get();
        let advanceDiscountCollection = AdvanceDiscount.findOne({name: 'saleOrderReceivePayment'});
        let notContainAdvanceDiscount = !_.includes(advanceDiscountCollection && advanceDiscountCollection.advanceDiscount, 'discount');
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
        let advanceDiscountCollection = AdvanceDiscount.findOne({name: 'saleOrderReceivePayment'});
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
        let advanceDiscountCollection = AdvanceDiscount.findOne({name: 'saleOrderReceivePayment'});
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
        let lastPayment = getLastPayment(this._id);
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
    defaultDate(){
        return moment().toDate();
    }
});

indexTmpl.events({
    'change #penalty'(event, instance){
        isPenalty.set($(event.currentTarget).prop('checked'));
        clearChecbox();
    },
    'change .disable-term'(event, instance){
        if ($(event.currentTarget).prop('checked')) {
            Session.set('disableTerm', true);
            Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0})
        } else {
            getCustomerTerm(Session.get('customerId'));
        }
    },
    'change [name="customerId"]' (event, instance) {
        if (event.currentTarget.value != '') {
            clearChecbox();
            Session.set('customerId', event.currentTarget.value);
        }
    },
    'change [name="invoiceId"]' (event, instance) {
        clearChecbox();
        if (event.currentTarget.value != '') {
            Session.set('invoiceId', event.currentTarget.value.trim());
        }
    },
    'click .select-invoice' (event, instance) {
        let selectedOrder = Session.get('invoicesObj');
        let penalty = countLateInvoice.get().calculatePenalty[this._id] || 0;
        let lastPayment = getLastPayment(this._id);
        let discount = $(event.currentTarget).parents('invoice-parents').find('.discount').val();
        if ($(event.currentTarget).prop('checked')) {
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(lastPayment == 0 ? this.total + penalty : lastPayment + penalty).change();

        } else {
            delete selectedOrder[this._id];
            selectedOrder.count -= 1;
            $(event.currentTarget).parents('.invoice-parents').find('.total').val('');
            Session.set('invoicesObj', selectedOrder);
        }
    },
    'click .select-all' (event, instance) {
        clearChecbox();
        if ($(event.currentTarget).prop('checked')) {
            let saleObj = Session.get('invoicesObj');
            let total = [];
            let index = 0;
            let currentSelectDate = currentPaymentDate.get();
            let customer = getCustomerInfo(Session.get('customerId'));
            let invoicesObj;
            if (customer.termId) {
                invoicesObj = Order.find({}, {
                    sort: {
                        _id: 1
                    }
                });
            } else {
                invoicesObj = Order.find({}, {sort: {_id: 1}});
            }
            invoicesObj.forEach((sale) => {
                let lastPaymentDate = getLastPaymentDate(sale._id);
                //check if current select date is not smaller than last paymentDate
                if (!lastPaymentDate || (lastPaymentDate && moment(currentSelectDate).isAfter(lastPaymentDate))) {
                    let lastPayment = getLastPayment(sale._id);
                    let penalty = isPenalty.get() ? (countLateInvoice.get().calculatePenalty[sale._id] || 0) : 0;
                    sale.penalty = penalty;
                    sale.dueAmount = lastPayment == 0 ? sale.total : lastPayment;
                    sale.receivedPay = lastPayment == 0 ? sale.total : lastPayment; //receive amount of pay
                    saleObj[sale._id] = sale;
                    total.push(sale.dueAmount + penalty);
                }
            });
            saleObj.count = invoicesObj.count();
            Session.set('invoicesObj', saleObj);
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
        let penalty = isPenalty.get() ? countLateInvoice.get().calculatePenalty[this._id] || 0 : 0;
        if (event.currentTarget.value == '') {
            //trigger change on total+
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(total - (cod + benefit) + penalty).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(total - (cod + benefit) + penalty).format('0,0.00')).change();
            $(event.currentTarget).val('0');

        } else {
            //trigger change on total
            let valueAfterDiscount = (total - (cod + benefit + parseFloat(event.currentTarget.value)) ) + penalty;
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
        let penalty = isPenalty.get() ? countLateInvoice.get().calculatePenalty[this._id] || 0 : 0;
        if (event.currentTarget.value == '') {
            //trigger change on total+
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(total - (discount + benefit) + penalty).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(total - (discount + benefit) + penalty).format('0,0.00')).change();
            $(event.currentTarget).val('0');

        } else {
            //trigger change on total
            let valueAfterCod = (total - (discount + benefit + parseFloat(event.currentTarget.value))) + penalty;
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
        let penalty = isPenalty.get() ? countLateInvoice.get().calculatePenalty[this._id] || 0 : 0;
        if (event.currentTarget.value == '') {
            //trigger change on total+
            $(event.currentTarget).parents('.invoice-parents').find('.total').val(total-(discount+cod) + penalty).change();
            $(event.currentTarget).parents('.invoice-parents').find('.actual-pay').val(numeral(total-(discount+cod) + penalty).format('0,0.00')).change();
            $(event.currentTarget).val('0');

        } else {
            //trigger change on total
            let valueAfterbenefit = (total - (discount + cod + parseFloat(event.currentTarget.value))) + penalty;
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
        let selectedOrder = Session.get('invoicesObj');
        let lastPayment = getLastPayment(this._id);
        let discount = $(event.currentTarget).parents('.invoice-parents').find('.discount').val(); // get discount
        let cod = $(event.currentTarget).parents('.invoice-parents').find('.cod').val(); // get discount
        let benefit = $(event.currentTarget).parents('.invoice-parents').find('.benefit').val(); // get discount
        let penalty = isPenalty.get() ? countLateInvoice.get().calculatePenalty[this._id] || 0 : 0;
        if (event.currentTarget.value == '' || event.currentTarget.value == '0') {
            if (_.has(selectedOrder, this._id)) {
                selectedOrder.count -= 1;
                delete selectedOrder[this._id];
                Session.set('invoicesObj', selectedOrder);
                $(event.currentTarget).val('');
                $(event.currentTarget).parents('.invoice-parents').find('.select-invoice').prop('checked', false);
            }
        } else {
            if (!_.has(selectedOrder, this._id)) {
                selectedOrder.count += 1;
            }
            selectedOrder[this._id] = this;
            selectedOrder[this._id].discount = parseFloat(discount);
            selectedOrder[this._id].cod = parseFloat(cod);
            selectedOrder[this._id].benefit = parseFloat(benefit);
            selectedOrder[this._id].penalty = penalty;
            selectedOrder[this._id].receivedPay = parseFloat(event.currentTarget.value);
            selectedOrder[this._id].dueAmount = lastPayment == 0 ? this.total - discount : lastPayment;
            selectedOrder[this._id].dueAmount = lastPayment == 0 ? selectedOrder[this._id].dueAmount - cod : selectedOrder[this._id].dueAmount;
            selectedOrder[this._id].dueAmount = lastPayment == 0 ? selectedOrder[this._id].dueAmount - benefit : selectedOrder[this._id].dueAmount;
            $(event.currentTarget).parents('.invoice-parents').find('.select-invoice').prop('checked', true);
            if (parseFloat(event.currentTarget.value) > selectedOrder[this._id].dueAmount) { //check if entering payment greater than dueamount
                selectedOrder[this._id].receivedPay = selectedOrder[this._id].dueAmount;
                $(event.currentTarget).parents('.invoice-parents').find('.total').val(selectedOrder[this._id].dueAmount + penalty);
            }
            Session.set('invoicesObj', selectedOrder);
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
    },
    "click .create-penalty"(event, instance){
        alertify.penalty(fa('', 'Create New Penalty'), renderTemplate(Template.PPOS_penaltyNew));
    }
});
indexTmpl.onDestroyed(function () {
    countLateInvoice.set(0);
    Session.set('createPenalty', undefined);
});
//functions
function clearChecbox() {
    Session.set('invoiceId', 0); //clear checkbox
    Session.set('disableTerm', false);
    Session.set('invoiceId', '');
    Session.set('invoicesObj', {
        count: 0
    }); //set obj to empty on keychange
    $(".disable-term").prop('checked', false);
    $(".select-invoice").each(function () {
        $(this).prop('checked', false);
        $(this).parents('.invoice-parents').find('.total').val('');
    })
}
function getLastPayment(invoiceId) {
    let saleOrderReceivePayments = SaleOrderReceivePayment.find({invoiceId: invoiceId}, {
        sort: {
            _id: 1,
            paymentDate: 1
        }
    });
    if (saleOrderReceivePayments.count() > 0) {
        let lastPayment = _.last(saleOrderReceivePayments.fetch());
        return lastPayment.balanceAmount;
    }
    return 0;
}
function getLastPaymentDate(invoiceId) {
    let saleOrderReceivePayments = SaleOrderReceivePayment.find({invoiceId: invoiceId}, {
        sort: {
            _id: 1,
            paymentDate: 1
        }
    });
    if (saleOrderReceivePayments.count() > 0) {
        let lastPayment = _.last(saleOrderReceivePayments.fetch());
        return lastPayment.paymentDate;
    }
    return false;
}
function checkTerm(self) {
    if (self.paymentStatus == 'active') {
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
function getCustomerTerm(customerId) {
    let customer = getCustomerInfo(customerId);
    if (customer && customer.termId) {
        Meteor.call('getTerm', customer.termId, function (err, result) {
            Session.set('discount', {
                termName: result.name,
                discountIfPaidWithin: result.discountIfPaidWithin,
                discountPercentages: result.discountPercentages
            });
        });
        return `Term: ${customer._term.name}`;
    } else {
        Session.set('discount', {discountIfPaidWithin: 0, discountPerecentages: 0, invoiceId: ''});
        return 0;

    }
    return false;
}
function getCustomerInfo(id) {
    return Customers.findOne(id);
}
//autoform hook
let hooksObject = {
    onSubmit(){
        this.event.preventDefault();
        let invoicesObj = Session.get('invoicesObj');
        let branch = Session.get('currentBranch');
        delete invoicesObj.count;
        if (_.isEmpty(invoicesObj)) {
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
                saleOrderReceivePayment.callPromise({paymentDate, invoicesObj, branch, voucherId})
                    .then(function (result) {
                        clearChecbox();
                        swal({
                            title: "Receive Payment",
                            text: "Successfully paid!",
                            type: "success",
                            confirmButtonClass: "btn-success",
                            showConfirmButton: true,
                            timer: 3000
                        });
                    })
                    .catch(function (err) {
                        Session.set('invoicesObj', {count: 0});
                        swal({
                            title: "[Error]",
                            text: err.message,
                            type: "danger",
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
    'PPOS_saleOrderReceivePayment'
], hooksObject);
