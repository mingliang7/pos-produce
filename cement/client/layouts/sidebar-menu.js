import {Template} from 'meteor/templating';
import {TAPi18n} from 'meteor/tap:i18n';
import 'meteor/tap:i18n-ui';

// Page
import './sidebar-menu.html';

Tracker.autorun(function () {
    if (Meteor.userId() || Session.get('currentBranch')) {
        Meteor.call('currentUserStockAndAccountMappingDoc', {
            userId: Meteor.userId(),
            branchId: Session.get('currentBranch')
        }, function (err, result) {
            Session.set('currentUserStockAndAccountMappingDoc', result);
        });
    }
});

Template.Cement_sidebarMenu.helpers({
    // customer
    customerList(){
        return `/cement/report/customerListReport?&branchId=${Session.get('currentBranch')}`;
    },
    groupBalance() {
        return `/cement/report/groupCustomerBalance?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
    },
    termBalance() {
        return `/cement/report/termCustomerBalance?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}&type=active`;
    },
    unpaidSoByCustomer() {
        return `/cement/report/invoiceSOBalance?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}&type=active`;
    },
    customerHistory() {
        return `/cement/report/customerHistory?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}`;
    },
    customerHistorySO() {
        return `/cement/report/customerHistorySO?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}`;
    },
    saleOrderDetail() {
        return `/cement/report/sale-order-detail?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}`;
    },
    unpaidCustomerSummary() {
        return `/cement/report/unpaidCustomerSummary?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}`;
    },
    invoiceByCustomer() {
        return `/cement/report/invoiceByCustomer?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}`;
    },
    invoiceEnterBill() {
        return `/cement/report/invoiceEnterBill?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}`;
    },
    invoiceSummary() {
        return `/cement/report/invoice?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
    },
    saleOrderSummary() {
        return `/cement/report/saleOrderSummary?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
    },
    invoiceByItem() {
        return `/cement/report/invoiceByItemReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}`;
    },
    groupInvoice() {
        return `/cement/report/groupReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    receivePayment() {
        return `/cement/report/payment?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branchId=${Session.get('currentBranch')}&sortBy=paymentDate`;
    },
    saleOrder() {
        return `/cement/report/saleOrderReport?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}&status=active`;
    },
    // Vendor
    bill() {
        return `/cement/report/billReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    billByItem() {
        return `/cement/report/billByItemReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
    },
    billByVendor() {
        return `/cement/report/billByVendorReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    groupBill() {
        return `/cement/report/groupBillReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    payBillHistory() {
        return `/cement/report/payBillHistory?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
    },
    vendorTermHistory() {
        return `/cement/report/vendorTermHistory?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
    },
    vendorGroupHistory() {
        return `/cement/report/vendorGroupHistory?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}`;
    },
    payEnterBill() {
        return '#'
    },
    prepaidOrder() {
        return `/cement/report/prepaidOrderReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
    },
    // Data
    companyExchangeRingPull() {
        return `/cement/report/companyExchangeRingPullReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    exchangeGratis() {
        return `/cement/report/exchangeGratisReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    exchangeRingPull() {
        return `/cement/report/exchangeRingPullReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    exchangeRingPullStockBalance() {
        return `/cement/report/exchangeRingPullStockBalance?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    lendingStock() {
        return `/cement/report/lendingStockReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD hh:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    locationTransfer() {
        return `/cement/report/locationTransfer?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&fromBranch=${Session.get('currentBranch')}`;
    },
    receiveItemSummary() {
        return `/cement/report/receiveItemSummary?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    ringPullTransfer() {
        return `/cement/report/ringPullTransfer?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&fromBranch=${Session.get('currentBranch')}`;
    },
    transferMoney() {
        return `/cement/report/transferMoneyReport?date=${moment().startOf('days').format('YYYY-MM-DD HH:mm:ss')},${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&fromBranch=${Session.get('currentBranch')}`;
    },
    purchaseOrder() {
        return `/cement/report/purchaseOrderReport?date=${moment().endOf('days').format('YYYY-MM-DD HH:mm:ss')}&branch=${Session.get('currentBranch')}`;
    },
    purchaseOrderDetail() {
        return `/cement/report/purchaseOrderDetailReport`;
    },
    stockBalance() {
        let params = `/cement/report/stockBalance?date=${moment().format('YYYY-MM-DD 23:59:59')}&branch=${Session.get('currentBranch')}`;
        return params;
    },
});