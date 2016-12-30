import {Meteor} from 'meteor/meteor'
import {Session} from 'meteor/session'
import {FlowRouter} from 'meteor/kadira:flow-router'
import {FlowRouterTitle} from 'meteor/ostrio:flow-router-title'
import 'meteor/arillo:flow-router-helpers'
import 'meteor/zimme:active-route'
import 'meteor/theara:flow-router-breadcrumb'

// Lib
import {__} from '../../core/common/libs/tapi18n-callback-helper.js'

// Layout
import {Layout} from '../../core/client/libs/render-layout.js'
import '../../core/imports/ui/layouts/login'
import '../../core/imports/ui/layouts/main'

// Group
let CementRoutes = FlowRouter.group({
    prefix: '/cement',
    title: 'CEMENT',
    titlePrefix: 'CEMENT > ',
    subscriptions: function (params, queryParams) {
        //     this.register('files', Meteor.subscribe('files'))
    }
})

// Home
import '../imports/ui/pages/home.js'
CementRoutes.route('/home', {
    name: 'cement.home',
    title: __('cement.home.title'),
    action: function (param, queryParam) {
        Layout.main('Cement_home')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.home.title'),
        icon: 'home',
        parent: 'core.welcome'
    }
})

// Item
import '../imports/ui/pages/item.js'
CementRoutes.route('/item', {
    name: 'cement.item',
    title: __('cement.item.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_item')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.item.title'),
        icon: 'product-hunt',
        parent: 'cement.home'
    }
})

// Customer
import '../imports/ui/pages/customer.js'
CementRoutes.route('/customer', {
    name: 'cement.customer',
    title: __('cement.customer.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_customer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.customer.title'),
        icon: 'users',
        parent: 'cement.home'
    }
})
// receive payment
import '../imports/ui/pages/receivePayment.js'
CementRoutes.route('/customer/:customerId?/receive-payment/:invoiceId?', {
    name: 'cement.receivePayment',
    title: __('cement.receivePayment.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_receivePayment')
    },
    breadcrumb: {
        params: ['customerId', 'invoiceId'],
        // queryParams: ['show', 'color'],
        title: __('cement.receivePayment.title'),
        icon: 'credit-card',
        parent: 'cement.customer'
    }
})

import '../imports/ui/pages/saleOrderReceivePayment.js'
CementRoutes.route('/customer/:customerId?/sale-order-receive-payment/:invoiceId?', {
    name: 'cement.saleOrderReceivePayment',
    title: __('cement.saleOrderReceivePayment.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_saleOrderReceivePayment')
    },
    breadcrumb: {
        params: ['customerId', 'invoiceId'],
        // queryParams: ['show', 'color'],
        title: __('cement.saleOrderReceivePayment.title'),
        icon: 'credit-card',
        parent: 'cement.customer'
    }
})
/*// receive payment with invoice id link
 import '../imports/ui/pages/receivePayment.js'
 CementRoutes.route('/customer/:customerId/receive-payment/:invoiceId', {
 name: 'cement.receivePaymentWithInvoiceId',
 title: __('cement.receivePayment.title'),
 action: function (params, queryParams) {
 Layout.main('Cement_receivePayment')
 },
 breadcrumb: {
 params: ['customerId', 'invoiceId'],
 //queryParams: ['show', 'color'],
 title: __('cement.receivePayment.title'),
 icon: 'credit-card',
 parent: 'cement.customer'
 }
 });*/
// Order
import '../imports/ui/pages/order.js'
CementRoutes.route('/order', {
    name: 'cement.order',
    title: __('cement.order.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_order')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.order.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})
// Purchase Order
import '../imports/ui/pages/purchaseOrder.js'
CementRoutes.route('/purchase-order', {
    name: 'cement.purchaseOrder',
    title: __('cement.purchaseOrder.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_purchaseOrder')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.purchaseOrder.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})
// unit
import '../imports/ui/pages/unit'
CementRoutes.route('/unit', {
    name: 'cement.unit',
    title: 'unit',
    action: function (params, queryParams) {
        Layout.main('Cement_unit')
    },
    breadcrumb: {
        title: 'unit',
        icon: 'cart-plus',
        parent: 'cement.home'
    }

})

import '../imports/ui/pages/term.js'
CementRoutes.route('/term', {
    name: 'cement.term',
    title: 'term',
    action: function (params, queryParams) {
        Layout.main('Cement_term')
    },
    breadcrumb: {
        title: 'term',
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

// Categories
import '../imports/ui/pages/category.js'
CementRoutes.route('/category', {
    name: 'cement.category',
    title: __('cement.category.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_category')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.category.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/vendor.js'
CementRoutes.route('/vendor', {
    name: 'cement.vendor',
    title: __('cement.vendor.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_vendor')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.vendor.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/paymentGroup.js'
CementRoutes.route('/payment-group', {
    name: 'cement.paymentGroup',
    title: __('cement.paymentGroup.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_paymentGroup')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.paymentGroup.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/stockLocation.js'
CementRoutes.route('/stock-location', {
    name: 'cement.stockLocation',
    title: __('cement.stockLocation.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_stockLocation')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.stockLocation.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})
import '../imports/ui/pages/rep.js'
CementRoutes.route('/rep', {
    name: 'cement.rep',
    title: __('cement.rep.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_rep')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.rep.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

// Invoice
import '../imports/ui/pages/invoice.js'
CementRoutes.route('/invoice', {
    name: 'cement.invoice',
    title: __('cement.invoice.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_invoice')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.invoice.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

// Enter Bill
import '../imports/ui/pages/enterBill.js'
CementRoutes.route('/enterBill', {
    name: 'cement.enterBill',
    title: __('cement.enterBill.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_enterBill')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.enterBill.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})
// Pay Bill
import '../imports/ui/pages/payBill'
CementRoutes.route('/vendor/:vendorId?/payBill/:billId?', {
    name: 'cement.payBill',
    title: 'Pay Bill',
    action: function (params, queryParams) {
        Layout.main('Cement_payBill')
    },
    breadcrumb: {
        params: ['vendorId'],
        title: 'Pay Bill',
        icon: 'cart-plus',
        parent: 'cement.vendor'
    }
})

// confirm transfer location
import '../imports/ui/pages/confirm-transferlocation'
CementRoutes.route('/confirm-transferLocation', {
    name: 'cement.confirmTransferLocation',
    title: 'Location Transfers Request',
    action: function (params, queryParams) {
        Layout.main('Cement_confirmTransferLocation')
    },
    breadcrumb: {
        title: 'Location Transfers Request'
    }
})
// Location Transfer
import '../imports/ui/pages/locationTransfer.js'
CementRoutes.route('/locationTransfer', {
    name: 'cement.locationTransfer',
    title: __('cement.locationTransfer.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_locationTransfer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.locationTransfer.title'),
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/prepaidOrder.js'
CementRoutes.route('/prepaid-order', {
    name: 'cement.prepaidOrder',
    title: __('cement.prepaidOrder.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_prepaidOrder')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.prepaidOrder.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/requirePassword.js'
CementRoutes.route('/credit-validation', {
    name: 'cement.creditValidation',
    title: 'Credit Validation',
    action: function (params, queryParams) {
        Layout.main('Cement_requirePassword')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Credit Validation',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/penalty.js'
CementRoutes.route('/penalty', {
    name: 'cement.penalty',
    title: 'Penalty',
    action: function (params, queryParams) {
        Layout.main('Cement_penalty')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Penalty',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/lendingStock.js'
CementRoutes.route('/lending-stock', {
    name: 'cement.lendingStock',
    title: 'LendingStock',
    action: function (params, queryParams) {
        Layout.main('Cement_lendingStock')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'LendingStock',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})
import '../imports/ui/pages/paymentTransactionList.js'
CementRoutes.route('/payment-transaction-list', {
    name: 'cement.paymentTransactionList',
    title: 'Receive Payment Transaction',
    action: function (params, queryParams) {
        Layout.main('Cement_paymentTransaction')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Receive Payment Transaction',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/payBillTransaction.js'
CementRoutes.route('/payBill-transaction-list', {
    name: 'cement.payBillTransactionList',
    title: 'PayBill Transaction',
    action: function (params, queryParams) {
        Layout.main('Cement_payBillTransaction')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'PayBill Transaction',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})
import '../imports/ui/pages/exchangeRingPull.js'
CementRoutes.route('/exchange-ring-pull', {
    name: 'cement.exchangeRingPull',
    title: 'Exchange Ring Pull',
    action: function (params, queryParams) {
        Layout.main('Cement_exchangeRingPull')
    },
    breadcrumb: {
        title: 'Exchange Ring Pull',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/groupInvoice.js'
CementRoutes.route('/group-invoice', {
    name: 'cement.groupInvoiceList',
    title: 'Group Invoice',
    action: function (params, queryParams) {
        Layout.main('Cement_groupInvoiceList')
    },
    breadcrumb: {
        title: 'Group Invoice',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/groupBill.js'
CementRoutes.route('/group-bill', {
    name: 'cement.groupBillList',
    title: 'Group Bill',
    action: function (params, queryParams) {
        Layout.main('Cement_groupBill')
    },
    breadcrumb: {
        title: 'Group Bill',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/ringPullTransfer.js'
CementRoutes.route('/ring-pull-transfer', {
    name: 'cement.ringPullTransfer',
    title: 'Ring Pull Transfer',
    action: function (params, queryParams) {
        Layout.main('Cement_ringPullTransfer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Ring Pull Transfer',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/receiveItem/receiveItem'
CementRoutes.route('/receive-item', {
    name: 'cement.receiveItem',
    title: 'Receive Item',
    action: function (params, queryParams) {
        Layout.main('Cement_receiveItem')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'Receive Item',
        parent: 'cement.home'
    }
})
import '../imports/ui/pages/ringPullRequest.js'
CementRoutes.route('/ring-pull-transfer-request', {
    name: 'cement.ringPullTransferRequest',
    title: 'Ring Pull Transfer Request',
    action: function (params, queryParams) {
        Layout.main('Cement_ringPullRequest')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'Ring Pull Transfer Request',

        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/stockAndAccountMapping.js'
CementRoutes.route('/stock-and-account-mapping', {
    name: 'cement.stockAndAccountMapping',
    title: 'Stock And Account Mapping',
    action: function (params, queryParams) {
        Layout.main('Cement_stockAndAccountMapping')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'Stock And Account Mapping',
        parent: 'cement.home'
    }
})
import '../imports/ui/pages/companyExchangeRingPull.js'
CementRoutes.route('/company-exchange-ring-pull', {
    name: 'cement.companyExchangeRingPull',
    title: 'Company Exchange Ring Pull',
    action: function (params, queryParams) {
        Layout.main('Cement_companyExchangeRingPull')
    },
    breadcrumb: {
        title: 'Company Exchange Ring Pull',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/whiteListCustomer.js'
CementRoutes.route('/white-list-customer', {
    name: 'cement.whiteListCustomer',
    title: 'White List Customer',
    action: function (params, queryParams) {
        Layout.main('Cement_whiteListCustomer')
    },
    breadcrumb: {
        title: 'White List Customer',
        // icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/exchangeGratis.js'
CementRoutes.route('/exchange-gratis', {
    name: 'cement.exchangeGratis',
    title: __('cement.exchangeGratis.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_exchangeGratis')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.exchangeGratis.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/itemPriceForCustomer.js'
CementRoutes.route('/itemPriceForCustomer', {
    name: 'cement.itemPriceForCustomer',
    title: __('cement.itemPriceForCustomer.title'),
    action: function (params, queryParams) {
        Layout.main('Cement_itemPriceForCustomer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('cement.itemPriceForCustomer.title'),
        icon: 'cart-plus',
        parent: 'cement.home'
    }
})

import '../imports/ui/pages/accountIntegrationSetting'
CementRoutes.route('/account-integration-setting', {
    name: 'cement.accountIntegrationSetting',
    title: 'Account Integration Setting',
    action: function (params, queryParams) {
        Layout.main('Cement_accountIntegrationSetting')
    },
    breadcrumb: {
        title: 'Account Integration Setting',
        icon: 'cart-plus',
        parent: 'cement.home'
    }

})
import '../imports/ui/pages/accountMapping'
CementRoutes.route('/accountMapping', {
    name: 'cement.accountMapping',
    title: 'Account Mapping',
    action: function (params, queryParams) {
        Layout.main('Cement_accountMapping')
    },
    breadcrumb: {
        title: 'Account Mapping',
        icon: '',
        parent: 'cement.home'
    }

})
import '../imports/ui/pages/quantityRangeMapping'
CementRoutes.route('/quantityRangeMapping', {
    name: 'cement.quantityRangeMapping',
    title: 'Quantity Range Mapping',
    action: function (params, queryParams) {
        Layout.main('Cement_quantityRangeMapping')
    },
    breadcrumb: {
        title: 'Quantity Range Mapping',
        icon: '',
        parent: 'cement.home'
    }

})
import '../imports/ui/pages/transferMoney'
CementRoutes.route('/transferMoney', {
    name: 'cement.transferMoney',
    title: 'Transfer Money',
    action: function (params, queryParams) {
        Layout.main('Cement_transferMoney')
    },
    breadcrumb: {
        title: 'Transfer Money',
        icon: '',
        parent: 'cement.home'
    }

})
import '../imports/ui/pages/transferMoneyRequest'
CementRoutes.route('/transferMoneyRequest', {
    name: 'cement.transferMoneyRequest',
    title: 'Transfer Money Request',
    action: function (params, queryParams) {
        Layout.main('Cement_transferMoneyRequest')
    },
    breadcrumb: {
        title: 'Transfer Money Request',
        icon: '',
        parent: 'cement.home'
    }

});

import '../imports/ui/pages/soPaymentTransaction'
CementRoutes.route('/soPaymentTransaction', {
    name: 'cement.soPaymentTransaction',
    title: 'SO Payment Transaction',
    action: function (params, queryParams) {
        Layout.main('Cement_soPaymentTransaction');
    },
    breadcrumb: {
        title: 'SO Payment Transaction',
        icon: '',
        parent: 'cement.home'
    }

});
import '../imports/ui/pages/purchaseOrderPayment'
CementRoutes.route('/purchaseOrderPayment', {
    name: 'cement.purchaseOrderPayment',
    title: 'PO Payment',
    action: function (params, queryParams) {
        Layout.main('Cement_purchaseOrderPayment');
    },
    breadcrumb: {
        title: 'PO Payment',
        icon: '',
        parent: 'cement.home'
    }

});
import '../imports/ui/pages/purchaseOrderPaymentTransaction'
CementRoutes.route('/purchaseOrderPaymentTransaction', {
    name: 'cement.purchaseOrderPaymentTransaction',
    title: 'PO Payment Transaction',
    action: function (params, queryParams) {
        Layout.main('Cement_purchaseOrderPaymentTransaction');
    },
    breadcrumb: {
        title: 'PO Payment Transaction',
        icon: '',
        parent: 'cement.home'
    }
});
import '../imports/ui/pages/unitConvert'
CementRoutes.route('/unitConvert', {
    name: 'cement.unitConvert',
    title: 'Unit Convert',
    action: function (params, queryParams) {
        Layout.main('Cement_unitConvert');
    },
    breadcrumb: {
        title: 'Unit Convert',
        icon: '',
        parent: 'cement.home'
    }
});

import '../imports/ui/pages/print/printInvoice'
CementRoutes.route('/print-invoice', {
    name: 'pos.printInvoice',
    title: 'Invoice',
    action: function (params,queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_printInvoice'});
    }
});