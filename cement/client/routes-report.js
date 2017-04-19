import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {FlowRouterTitle} from 'meteor/ostrio:flow-router-title';
import 'meteor/arillo:flow-router-helpers';
import 'meteor/zimme:active-route';
import 'meteor/theara:flow-router-breadcrumb';

// Lib
import {__} from '../../core/common/libs/tapi18n-callback-helper.js';

// Layout
import {Layout} from '../../core/client/libs/render-layout.js';
import '../../core/imports/ui/layouts/report/index.html';

// Group
let CementRoutes = FlowRouter.group({
    prefix: '/cement',
    title: "Simple CEMENT",
    titlePrefix: 'Simple CEMENT > ',
    subscriptions: function (params, queryParams) {
//     this.register('files', Meteor.subscribe('files'));
    }
});

// Customer list
import '../imports/ui/reports/customer.js';
CementRoutes.route('/customer-report', {
    name: 'cement.customerReport',
    title: __('cement.customerReport.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_customerReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('cement.customerReport.title'),
        icon: 'users',
        parent: 'cement.home'
    }
});

CementRoutes.route('/customer-report-gen', {
    name: 'cement.customerReportGen',
    title: __('cement.customerReport.title'),
    action: function (params, queryParams) {
        Layout.report('Cement_customerReportGen');
    }
});




CementRoutes.route('/order-report-gen', {
    name: 'cement.orderReportGen',
    title: __('cement.orderReport.title'),
    action: function (params, queryParams) {
        Layout.report('Cement_orderReportGen');
    }
});
//main report
import '../imports/ui/reports/main';
CementRoutes.route('/report', {
    name: 'cement.mainReport',
    title: 'Main Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_mainReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Main Report',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
});

import '../imports/ui/reports/invoice';
CementRoutes.route('/report/invoice', {
    name: 'cement.invoiceReport',
    title: 'Sale Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_invoiceReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/invoiceByCustomer';
CementRoutes.route('/report/invoiceByCustomer', {
    name: 'cement.invoiceByCustomerReport',
    title: 'Sale By Customer Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_invoiceByCustomerReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice By Customer Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/invoiceByItem';
CementRoutes.route('/report/invoiceByItemReport', {
    name: 'cement.invoiceByItemReport',
    title: 'Invoice By Item Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_invoiceByItemReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice By Item Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/billByItem';
CementRoutes.route('/report/billByItemReport', {
    name: 'cement.billByItemReport',
    title: 'Bill By Item Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_billByItemReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Bill By Item Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/payment';
CementRoutes.route('/report/payment', {
    name: 'cement.paymentReport',
    title: 'Receive Payment Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_paymentReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Receive Payment Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/stockBalance';
CementRoutes.route('/report/stockBalance', {
    name: 'cement.paymentReport',
    title: 'Stock Balance Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_stockBalanceReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Stock Balance Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});


import '../imports/ui/reports/locationTransfer';
CementRoutes.route('/report/locationTransfer', {
    name: 'cement.locationTransferReport',
    title: 'Location Transfer Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_locationTransferReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Location Transfer Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/ringPullTransfer';
CementRoutes.route('/report/ringPullTransfer', {
    name: 'cement.ringPullTransferReport',
    title: 'Ring Pull Transfer Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_ringPullTransferReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Ring Pull Transfer Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/billReport';
CementRoutes.route('/report/billReport', {
    name: 'cement.billReport',
    title: 'Bill Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_billReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Bill Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/billByVendor';
CementRoutes.route('/report/billByVendorReport', {
    name: 'cement.billByVendorReport',
    title: 'Bill By Vendor Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_billByVendorReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Bill By Vendor Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/prepaidOrderReport';
CementRoutes.route('/report/prepaidOrderReport', {
    name: 'cement.prepaidOrderReport',
    title: 'Prepaid Order Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_prepaidOrderReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Prepaid Order Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/exchangeRingPull';
CementRoutes.route('/report/exchangeRingPullReport', {
    name: 'cement.exchangeRingPullReport',
    title: 'Exchange Ring Pull Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_exchangeRingPullReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Exchange Ring Pull Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/lendingStockReport';
CementRoutes.route('/report/lendingStockReport', {
    name: 'cement.lendingStockReport',
    title: 'Lending Stock Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_lendingStockReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Lending Stock Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/companyExchangeRingPullReport';
CementRoutes.route('/report/companyExchangeRingPullReport', {
    name: 'cement.companyExchangeRingPullReport',
    title: 'Company Exchange Ring Pull Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_companyExchangeRingPullReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Company Exchange Ring Pull Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/exchangeGratis';
CementRoutes.route('/report/exchangeGratisReport', {
    name: 'cement.exchangeGratisReport',
    title: 'Exchange Gratis Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_exchangeGratisReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Exchange Gratis Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/saleOrderReport';
CementRoutes.route('/report/saleOrderReport', {
    name: 'cement.saleOrderReport',
    title: 'Sale Order Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_saleOrderReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Sale Order Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/groupReport';
CementRoutes.route('/report/groupReport', {
    name: 'cement.groupReport',
    title: 'Group Invoice Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_groupReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Group Invoice Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/groupBillReport';
CementRoutes.route('/report/groupBillReport', {
    name: 'cement.groupBillReport',
    title: 'Group Bill Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_groupBillReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Group Bill Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/termCustomerBalance';
CementRoutes.route('/report/termCustomerBalance', {
    name: 'cement.termCustomerBalance',
    title: 'Unpaid By Customer',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_termCustomerBalance');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Unpaid By Customer Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/groupCustomerBalance';
CementRoutes.route('/report/groupCustomerBalance', {
    name: 'cement.groupCustomerBalance',
    title: 'Group Customer Balance Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_groupCustomerBalance');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Group Customer Balance Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/receiveItemSummary';
CementRoutes.route('/report/receiveItemSummary', {
    name: 'cement.receiveItemSummary',
    title: 'Receive Item Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_receiveItemSummary');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Receive Item Summary Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/exchangeRingPullStockBalance';
CementRoutes.route('/report/exchangeRingPullStockBalance', {
    name: 'cement.exchangeRingPullStockBalanceReport',
    title: 'Exchange Ring Pull Stock Balance',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_exchangeRingPullStockBalance');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Exchange Ring Pull Stock Balance',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/transferMoneyReport';
CementRoutes.route('/report/transferMoneyReport', {
    name: 'cement.transferMoneyReport',
    title: 'Transfer Money Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_transferMoneyReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Transfer Money Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/unpaidCustomerSummary';
CementRoutes.route('/report/unpaidCustomerSummary', {
    name: 'cement.unpaidCustomerSummary',
    title: 'Unpaid Customer Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_unpaidCustomerSummaryReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Transfer Money Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/customerList';
CementRoutes.route('/report/customerListReport', {
    name: 'cement.customerList',
    title: 'Customer List',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_customerListReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Customer List',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});
import '../imports/ui/reports/invoiceEnterBill';
CementRoutes.route('/report/invoiceEnterBill', {
    name: 'cement.invoiceEnterBill',
    title: 'Sale & EnterBill',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_invoiceEnterBillReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice EnterBill',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/customerHistory';
CementRoutes.route('/report/customerHistory', {
    name: 'cement.customerHistory',
    title: 'Customer History',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_customerHistory');
    },
    breadcrumb: {
        title: 'Customer History',
        icon: '',
        parent: 'cement.home'
    }
});

import '../imports/ui/reports/saleOrderDetail';
CementRoutes.route('/report/sale-order-detail', {
    name: 'cement.saleOrderDetailReport',
    title: 'Sale Order Detail',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_saleOrderDetail');
    },
    breadcrumb: {
        title: 'Sale Order Detail',
        icon: '',
        parent: 'cement.home'
    }
});

import '../imports/ui/reports/invoiceSOBalance';
CementRoutes.route('/report/invoiceSOBalance', {
    name: 'cement.invoiceSOBalance',
    title: 'SO By Customer',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_invoiceSOBalance');
    },
    breadcrumb: {
        title: 'SO By Customer',
        icon: '',
        parent: 'cement.home'
    }
});

import '../imports/ui/reports/customerHistorySO';
CementRoutes.route('/report/customerHistorySO', {
    name: 'cement.customerHistorySO',
    title: 'Customer History SO',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_customerHistorySO');
    },
    breadcrumb: {
        title: 'Customer History SO',
        icon: '',
        parent: 'cement.home'
    }
});

import '../imports/ui/reports/saleOrderSummary';
CementRoutes.route('/report/saleOrderSummary', {
    name: 'cement.saleOrderSummary',
    title: 'Sale Order Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_saleOrderSummary');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Sale Order Summary Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/payBillHistory';
CementRoutes.route('/report/payBillHistory', {
    name: 'cement.payBillHistory',
    title: 'Pay Bill  History',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_payBillHistory');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Vendor History Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/vendorGroupHistory';
CementRoutes.route('/report/vendorGroupHistory', {
    name: 'cement.vendorGroupHistory',
    title: 'Vendor Group History',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_vendorGroupHistory');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Vendor Group History Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/purchaseOrderReport';
CementRoutes.route('/report/purchaseOrderReport', {
    name: 'cement.purchaseOrderReport',
    title: 'Purchase Order Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_purchaseOrderReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Purchase Order Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/purchaseOrderDetail';
CementRoutes.route('/report/purchaseOrderDetailReport', {
    name: 'cement.purchaseOrderDetailReport',
    title: 'Purchase Order Detail Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_purchaseOrderDetail');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Purchase Order Detail Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/vendorTermHistory';
CementRoutes.route('/report/vendorTermHistory', {
    name: 'cement.vendorTermHistory',
    title: 'Vendor Term History',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_vendorTermHistory');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Vendor Term History Report',
        // icon: 'cart-plus',
        parent: 'cement.mainReport'
    }
});

import '../imports/ui/reports/stockDetailReport';
CementRoutes.route('/report/stockDetail', {
    name: 'cement.stockDetail',
    title: 'Stock Detail',
    action: function (params, queryParams) {
        Layout.customReportLayout('Cement_stockDetailReport');
    },
    breadcrumb: {
        title: 'Stock Detail',
        icon: '',
        parent: 'pos.home'
    }
});