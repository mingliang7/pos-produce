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
let PPOSRoutes = FlowRouter.group({
    prefix: '/ppos',
    title: "Simple PPOS",
    titlePrefix: 'Simple PPOS > ',
    subscriptions: function (params, queryParams) {
//     this.register('files', Meteor.subscribe('files'));
    }
});

// Customer list
import '../imports/ui/reports/customer.js';
PPOSRoutes.route('/customer-report', {
    name: 'ppos.customerReport',
    title: __('ppos.customerReport.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_customerReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('ppos.customerReport.title'),
        icon: 'users',
        parent: 'ppos.home'
    }
});

PPOSRoutes.route('/customer-report-gen', {
    name: 'ppos.customerReportGen',
    title: __('ppos.customerReport.title'),
    action: function (params, queryParams) {
        Layout.report('PPOS_customerReportGen');
    }
});




PPOSRoutes.route('/order-report-gen', {
    name: 'ppos.orderReportGen',
    title: __('ppos.orderReport.title'),
    action: function (params, queryParams) {
        Layout.report('PPOS_orderReportGen');
    }
});
//main report
import '../imports/ui/reports/main';
PPOSRoutes.route('/report', {
    name: 'ppos.mainReport',
    title: 'Main Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_mainReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Main Report',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
});

import '../imports/ui/reports/invoice';
PPOSRoutes.route('/report/invoice', {
    name: 'ppos.invoiceReport',
    title: 'Sale Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_invoiceReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/invoiceByCustomer';
PPOSRoutes.route('/report/invoiceByCustomer', {
    name: 'ppos.invoiceByCustomerReport',
    title: 'Sale By Customer Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_invoiceByCustomerReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice By Customer Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/invoiceByItem';
PPOSRoutes.route('/report/invoiceByItemReport', {
    name: 'ppos.invoiceByItemReport',
    title: 'Invoice By Item Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_invoiceByItemReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice By Item Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/billByItem';
PPOSRoutes.route('/report/billByItemReport', {
    name: 'ppos.billByItemReport',
    title: 'Bill By Item Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_billByItemReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Bill By Item Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/payment';
PPOSRoutes.route('/report/payment', {
    name: 'ppos.paymentReport',
    title: 'Receive Payment Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_paymentReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Receive Payment Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/stockBalance';
PPOSRoutes.route('/report/stockBalance', {
    name: 'ppos.paymentReport',
    title: 'Stock Balance Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_stockBalanceReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Stock Balance Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});


import '../imports/ui/reports/locationTransfer';
PPOSRoutes.route('/report/locationTransfer', {
    name: 'ppos.locationTransferReport',
    title: 'Location Transfer Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_locationTransferReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Location Transfer Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/ringPullTransfer';
PPOSRoutes.route('/report/ringPullTransfer', {
    name: 'ppos.ringPullTransferReport',
    title: 'Ring Pull Transfer Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_ringPullTransferReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Ring Pull Transfer Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/billReport';
PPOSRoutes.route('/report/billReport', {
    name: 'ppos.billReport',
    title: 'Bill Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_billReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Bill Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/billByVendor';
PPOSRoutes.route('/report/billByVendorReport', {
    name: 'ppos.billByVendorReport',
    title: 'Bill By Vendor Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_billByVendorReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Bill By Vendor Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/prepaidOrderReport';
PPOSRoutes.route('/report/prepaidOrderReport', {
    name: 'ppos.prepaidOrderReport',
    title: 'Prepaid Order Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_prepaidOrderReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Prepaid Order Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/exchangeRingPull';
PPOSRoutes.route('/report/exchangeRingPullReport', {
    name: 'ppos.exchangeRingPullReport',
    title: 'Exchange Ring Pull Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_exchangeRingPullReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Exchange Ring Pull Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/lendingStockReport';
PPOSRoutes.route('/report/lendingStockReport', {
    name: 'ppos.lendingStockReport',
    title: 'Lending Stock Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_lendingStockReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Lending Stock Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/companyExchangeRingPullReport';
PPOSRoutes.route('/report/companyExchangeRingPullReport', {
    name: 'ppos.companyExchangeRingPullReport',
    title: 'Company Exchange Ring Pull Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_companyExchangeRingPullReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Company Exchange Ring Pull Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/exchangeGratis';
PPOSRoutes.route('/report/exchangeGratisReport', {
    name: 'ppos.exchangeGratisReport',
    title: 'Exchange Gratis Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_exchangeGratisReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Exchange Gratis Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/saleOrderReport';
PPOSRoutes.route('/report/saleOrderReport', {
    name: 'ppos.saleOrderReport',
    title: 'Sale Order Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_saleOrderReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Sale Order Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/groupReport';
PPOSRoutes.route('/report/groupReport', {
    name: 'ppos.groupReport',
    title: 'Group Invoice Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_groupReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Group Invoice Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/groupBillReport';
PPOSRoutes.route('/report/groupBillReport', {
    name: 'ppos.groupBillReport',
    title: 'Group Bill Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_groupBillReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Group Bill Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/termCustomerBalance';
PPOSRoutes.route('/report/termCustomerBalance', {
    name: 'ppos.termCustomerBalance',
    title: 'Unpaid By Customer',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_termCustomerBalance');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Unpaid By Customer Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/groupCustomerBalance';
PPOSRoutes.route('/report/groupCustomerBalance', {
    name: 'ppos.groupCustomerBalance',
    title: 'Group Customer Balance Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_groupCustomerBalance');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Group Customer Balance Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/receiveItemSummary';
PPOSRoutes.route('/report/receiveItemSummary', {
    name: 'ppos.receiveItemSummary',
    title: 'Receive Item Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_receiveItemSummary');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Receive Item Summary Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/exchangeRingPullStockBalance';
PPOSRoutes.route('/report/exchangeRingPullStockBalance', {
    name: 'ppos.exchangeRingPullStockBalanceReport',
    title: 'Exchange Ring Pull Stock Balance',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_exchangeRingPullStockBalance');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Exchange Ring Pull Stock Balance',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/transferMoneyReport';
PPOSRoutes.route('/report/transferMoneyReport', {
    name: 'ppos.transferMoneyReport',
    title: 'Transfer Money Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_transferMoneyReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Transfer Money Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/unpaidCustomerSummary';
PPOSRoutes.route('/report/unpaidCustomerSummary', {
    name: 'ppos.unpaidCustomerSummary',
    title: 'Unpaid Customer Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_unpaidCustomerSummaryReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Transfer Money Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/customerList';
PPOSRoutes.route('/report/customerListReport', {
    name: 'ppos.customerList',
    title: 'Customer List',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_customerListReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Customer List',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});
import '../imports/ui/reports/invoiceEnterBill';
PPOSRoutes.route('/report/invoiceEnterBill', {
    name: 'ppos.invoiceEnterBill',
    title: 'Sale & EnterBill',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_invoiceEnterBillReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Invoice EnterBill',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/customerHistory';
PPOSRoutes.route('/report/customerHistory', {
    name: 'ppos.customerHistory',
    title: 'Customer History',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_customerHistory');
    },
    breadcrumb: {
        title: 'Customer History',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/reports/saleOrderDetail';
PPOSRoutes.route('/report/sale-order-detail', {
    name: 'ppos.saleOrderDetailReport',
    title: 'Sale Order Detail',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_saleOrderDetail');
    },
    breadcrumb: {
        title: 'Sale Order Detail',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/reports/invoiceSOBalance';
PPOSRoutes.route('/report/invoiceSOBalance', {
    name: 'ppos.invoiceSOBalance',
    title: 'SO By Customer',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_invoiceSOBalance');
    },
    breadcrumb: {
        title: 'SO By Customer',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/reports/customerHistorySO';
PPOSRoutes.route('/report/customerHistorySO', {
    name: 'ppos.customerHistorySO',
    title: 'Customer History SO',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_customerHistorySO');
    },
    breadcrumb: {
        title: 'Customer History SO',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/reports/saleOrderSummary';
PPOSRoutes.route('/report/saleOrderSummary', {
    name: 'ppos.saleOrderSummary',
    title: 'Sale Order Summary',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_saleOrderSummary');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Sale Order Summary Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/payBillHistory';
PPOSRoutes.route('/report/payBillHistory', {
    name: 'ppos.payBillHistory',
    title: 'Pay Bill  History',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_payBillHistory');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Vendor History Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/vendorGroupHistory';
PPOSRoutes.route('/report/vendorGroupHistory', {
    name: 'ppos.vendorGroupHistory',
    title: 'Vendor Group History',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_vendorGroupHistory');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Vendor Group History Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/purchaseOrderReport';
PPOSRoutes.route('/report/purchaseOrderReport', {
    name: 'ppos.purchaseOrderReport',
    title: 'Purchase Order Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_purchaseOrderReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Purchase Order Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/purchaseOrderDetail';
PPOSRoutes.route('/report/purchaseOrderDetailReport', {
    name: 'ppos.purchaseOrderDetailReport',
    title: 'Purchase Order Detail Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_purchaseOrderDetail');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Purchase Order Detail Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/vendorTermHistory';
PPOSRoutes.route('/report/vendorTermHistory', {
    name: 'ppos.vendorTermHistory',
    title: 'Vendor Term History',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_vendorTermHistory');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Vendor Term History Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});

import '../imports/ui/reports/stockDetailReport';
PPOSRoutes.route('/report/stockDetail', {
    name: 'ppos.stockDetail',
    title: 'Stock Detail',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_stockDetailReport');
    },
    breadcrumb: {
        title: 'Stock Detail',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/reports/enterBillByItem';
PPOSRoutes.route('/report/enterBillByItemReport', {
    name: 'ppos.enterBillByReport',
    title: 'Enter Bill By Item Report',
    action: function (params, queryParams) {
        Layout.customReportLayout('PPOS_enterBillByItemReport');
    },
    breadcrumb:{
        // params:['vendorId'],
        title: 'Enter Bill By Item Report',
        // icon: 'cart-plus',
        parent: 'ppos.mainReport'
    }
});