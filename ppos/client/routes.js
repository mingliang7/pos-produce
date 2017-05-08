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
let PPOSRoutes = FlowRouter.group({
    prefix: '/ppos',
    title: 'PPOS',
    titlePrefix: 'PPOS > ',
    subscriptions: function (params, queryParams) {
        //     this.register('files', Meteor.subscribe('files'))
    }
})

// Home
import '../imports/ui/pages/home.js'
PPOSRoutes.route('/home', {
    name: 'ppos.home',
    title: __('ppos.home.title'),
    action: function (param, queryParam) {
        Layout.main('PPOS_home')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.home.title'),
        icon: 'home',
        parent: 'core.welcome'
    }
})

// Item
import '../imports/ui/pages/item.js'
PPOSRoutes.route('/item', {
    name: 'ppos.item',
    title: __('ppos.item.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_item')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.item.title'),
        icon: 'product-hunt',
        parent: 'ppos.home'
    }
})

// Customer
import '../imports/ui/pages/customer.js'
PPOSRoutes.route('/customer', {
    name: 'ppos.customer',
    title: __('ppos.customer.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_customer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.customer.title'),
        icon: 'users',
        parent: 'ppos.home'
    }
})
// receive payment
import '../imports/ui/pages/receivePayment.js'
PPOSRoutes.route('/customer/:customerId?/receive-payment/:invoiceId?', {
    name: 'ppos.receivePayment',
    title: __('ppos.receivePayment.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_receivePayment')
    },
    breadcrumb: {
        params: ['customerId', 'invoiceId'],
        // queryParams: ['show', 'color'],
        title: __('ppos.receivePayment.title'),
        icon: 'credit-card',
        parent: 'ppos.customer'
    }
})

import '../imports/ui/pages/saleOrderReceivePayment.js'
PPOSRoutes.route('/customer/:customerId?/sale-order-receive-payment/:invoiceId?', {
    name: 'ppos.saleOrderReceivePayment',
    title: __('ppos.saleOrderReceivePayment.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_saleOrderReceivePayment')
    },
    breadcrumb: {
        params: ['customerId', 'invoiceId'],
        // queryParams: ['show', 'color'],
        title: __('ppos.saleOrderReceivePayment.title'),
        icon: 'credit-card',
        parent: 'ppos.customer'
    }
})
/*// receive payment with invoice id link
 import '../imports/ui/pages/receivePayment.js'
 PPOSRoutes.route('/customer/:customerId/receive-payment/:invoiceId', {
 name: 'ppos.receivePaymentWithInvoiceId',
 title: __('ppos.receivePayment.title'),
 action: function (params, queryParams) {
 Layout.main('PPOS_receivePayment')
 },
 breadcrumb: {
 params: ['customerId', 'invoiceId'],
 //queryParams: ['show', 'color'],
 title: __('ppos.receivePayment.title'),
 icon: 'credit-card',
 parent: 'ppos.customer'
 }
 });*/
// Order
import '../imports/ui/pages/order.js'
PPOSRoutes.route('/order', {
    name: 'ppos.order',
    title: __('ppos.order.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_order')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.order.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})
// Purchase Order
import '../imports/ui/pages/purchaseOrder.js'
PPOSRoutes.route('/purchase-order', {
    name: 'ppos.purchaseOrder',
    title: __('ppos.purchaseOrder.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_purchaseOrder')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.purchaseOrder.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})
// unit
import '../imports/ui/pages/unit'
PPOSRoutes.route('/unit', {
    name: 'ppos.unit',
    title: 'unit',
    action: function (params, queryParams) {
        Layout.main('PPOS_unit')
    },
    breadcrumb: {
        title: 'unit',
        icon: 'cart-plus',
        parent: 'ppos.home'
    }

})

import '../imports/ui/pages/term.js'
PPOSRoutes.route('/term', {
    name: 'ppos.term',
    title: 'term',
    action: function (params, queryParams) {
        Layout.main('PPOS_term')
    },
    breadcrumb: {
        title: 'term',
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

// Categories
import '../imports/ui/pages/category.js'
PPOSRoutes.route('/category', {
    name: 'ppos.category',
    title: __('ppos.category.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_category')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.category.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/vendor.js'
PPOSRoutes.route('/vendor', {
    name: 'ppos.vendor',
    title: __('ppos.vendor.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_vendor')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.vendor.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/paymentGroup.js'
PPOSRoutes.route('/payment-group', {
    name: 'ppos.paymentGroup',
    title: __('ppos.paymentGroup.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_paymentGroup')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.paymentGroup.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/stockLocation.js'
PPOSRoutes.route('/stock-location', {
    name: 'ppos.stockLocation',
    title: __('ppos.stockLocation.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_stockLocation')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.stockLocation.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})
import '../imports/ui/pages/rep.js'
PPOSRoutes.route('/rep', {
    name: 'ppos.rep',
    title: __('ppos.rep.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_rep')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.rep.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

// Invoice
import '../imports/ui/pages/invoice.js'
PPOSRoutes.route('/invoice', {
    name: 'ppos.invoice',
    title: __('ppos.invoice.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_invoice')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.invoice.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

// Enter Bill
import '../imports/ui/pages/enterBill.js'
PPOSRoutes.route('/enterBill', {
    name: 'ppos.enterBill',
    title: __('ppos.enterBill.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_enterBill')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.enterBill.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})
// Pay Bill
import '../imports/ui/pages/payBill'
PPOSRoutes.route('/vendor/:vendorId?/payBill/:billId?', {
    name: 'ppos.payBill',
    title: 'Pay Bill',
    action: function (params, queryParams) {
        Layout.main('PPOS_payBill')
    },
    breadcrumb: {
        params: ['vendorId'],
        title: 'Pay Bill',
        icon: 'cart-plus',
        parent: 'ppos.vendor'
    }
})

// confirm transfer location
import '../imports/ui/pages/confirm-transferlocation'
PPOSRoutes.route('/confirm-transferLocation', {
    name: 'ppos.confirmTransferLocation',
    title: 'Location Transfers Request',
    action: function (params, queryParams) {
        Layout.main('PPOS_confirmTransferLocation')
    },
    breadcrumb: {
        title: 'Location Transfers Request'
    }
})
// Location Transfer
import '../imports/ui/pages/locationTransfer.js'
PPOSRoutes.route('/locationTransfer', {
    name: 'ppos.locationTransfer',
    title: __('ppos.locationTransfer.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_locationTransfer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.locationTransfer.title'),
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/prepaidOrder.js'
PPOSRoutes.route('/prepaid-order', {
    name: 'ppos.prepaidOrder',
    title: __('ppos.prepaidOrder.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_prepaidOrder')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.prepaidOrder.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/requirePassword.js'
PPOSRoutes.route('/credit-validation', {
    name: 'ppos.creditValidation',
    title: 'Credit Validation',
    action: function (params, queryParams) {
        Layout.main('PPOS_requirePassword')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Credit Validation',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/penalty.js'
PPOSRoutes.route('/penalty', {
    name: 'ppos.penalty',
    title: 'Penalty',
    action: function (params, queryParams) {
        Layout.main('PPOS_penalty')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Penalty',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/lendingStock.js'
PPOSRoutes.route('/lending-stock', {
    name: 'ppos.lendingStock',
    title: 'LendingStock',
    action: function (params, queryParams) {
        Layout.main('PPOS_lendingStock')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'LendingStock',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})
import '../imports/ui/pages/paymentTransactionList.js'
PPOSRoutes.route('/payment-transaction-list', {
    name: 'ppos.paymentTransactionList',
    title: 'Receive Payment Transaction',
    action: function (params, queryParams) {
        Layout.main('PPOS_paymentTransaction')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Receive Payment Transaction',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/payBillTransaction.js'
PPOSRoutes.route('/payBill-transaction-list', {
    name: 'ppos.payBillTransactionList',
    title: 'PayBill Transaction',
    action: function (params, queryParams) {
        Layout.main('PPOS_payBillTransaction')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'PayBill Transaction',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})
import '../imports/ui/pages/exchangeRingPull.js'
PPOSRoutes.route('/exchange-ring-pull', {
    name: 'ppos.exchangeRingPull',
    title: 'Exchange Ring Pull',
    action: function (params, queryParams) {
        Layout.main('PPOS_exchangeRingPull')
    },
    breadcrumb: {
        title: 'Exchange Ring Pull',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/groupInvoice.js'
PPOSRoutes.route('/group-invoice', {
    name: 'ppos.groupInvoiceList',
    title: 'Group Invoice',
    action: function (params, queryParams) {
        Layout.main('PPOS_groupInvoiceList')
    },
    breadcrumb: {
        title: 'Group Invoice',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/groupBill.js'
PPOSRoutes.route('/group-bill', {
    name: 'ppos.groupBillList',
    title: 'Group Bill',
    action: function (params, queryParams) {
        Layout.main('PPOS_groupBill')
    },
    breadcrumb: {
        title: 'Group Bill',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/ringPullTransfer.js'
PPOSRoutes.route('/ring-pull-transfer', {
    name: 'ppos.ringPullTransfer',
    title: 'Ring Pull Transfer',
    action: function (params, queryParams) {
        Layout.main('PPOS_ringPullTransfer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: 'Ring Pull Transfer',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/receiveItem/receiveItem'
PPOSRoutes.route('/receive-item', {
    name: 'ppos.receiveItem',
    title: 'Receive Item',
    action: function (params, queryParams) {
        Layout.main('PPOS_receiveItem')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'Receive Item',
        parent: 'ppos.home'
    }
})
import '../imports/ui/pages/ringPullRequest.js'
PPOSRoutes.route('/ring-pull-transfer-request', {
    name: 'ppos.ringPullTransferRequest',
    title: 'Ring Pull Transfer Request',
    action: function (params, queryParams) {
        Layout.main('PPOS_ringPullRequest')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'Ring Pull Transfer Request',

        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/stockAndAccountMapping.js'
PPOSRoutes.route('/stock-and-account-mapping', {
    name: 'ppos.stockAndAccountMapping',
    title: 'Stock And Account Mapping',
    action: function (params, queryParams) {
        Layout.main('PPOS_stockAndAccountMapping')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],

        title: 'Stock And Account Mapping',
        parent: 'ppos.home'
    }
})
import '../imports/ui/pages/companyExchangeRingPull.js'
PPOSRoutes.route('/company-exchange-ring-pull', {
    name: 'ppos.companyExchangeRingPull',
    title: 'Company Exchange Ring Pull',
    action: function (params, queryParams) {
        Layout.main('PPOS_companyExchangeRingPull')
    },
    breadcrumb: {
        title: 'Company Exchange Ring Pull',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/whiteListCustomer.js'
PPOSRoutes.route('/white-list-customer', {
    name: 'ppos.whiteListCustomer',
    title: 'White List Customer',
    action: function (params, queryParams) {
        Layout.main('PPOS_whiteListCustomer')
    },
    breadcrumb: {
        title: 'White List Customer',
        // icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/exchangeGratis.js'
PPOSRoutes.route('/exchange-gratis', {
    name: 'ppos.exchangeGratis',
    title: __('ppos.exchangeGratis.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_exchangeGratis')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.exchangeGratis.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/itemPriceForCustomer.js'
PPOSRoutes.route('/itemPriceForCustomer', {
    name: 'ppos.itemPriceForCustomer',
    title: __('ppos.itemPriceForCustomer.title'),
    action: function (params, queryParams) {
        Layout.main('PPOS_itemPriceForCustomer')
    },
    breadcrumb: {
        // params: ['id'],
        // queryParams: ['show', 'color'],
        title: __('ppos.itemPriceForCustomer.title'),
        icon: 'cart-plus',
        parent: 'ppos.home'
    }
})

import '../imports/ui/pages/accountIntegrationSetting'
PPOSRoutes.route('/account-integration-setting', {
    name: 'ppos.accountIntegrationSetting',
    title: 'Account Integration Setting',
    action: function (params, queryParams) {
        Layout.main('PPOS_accountIntegrationSetting')
    },
    breadcrumb: {
        title: 'Account Integration Setting',
        icon: 'cart-plus',
        parent: 'ppos.home'
    }

})
import '../imports/ui/pages/accountMapping'
PPOSRoutes.route('/accountMapping', {
    name: 'ppos.accountMapping',
    title: 'Account Mapping',
    action: function (params, queryParams) {
        Layout.main('PPOS_accountMapping')
    },
    breadcrumb: {
        title: 'Account Mapping',
        icon: '',
        parent: 'ppos.home'
    }

})
import '../imports/ui/pages/quantityRangeMapping'
PPOSRoutes.route('/quantityRangeMapping', {
    name: 'ppos.quantityRangeMapping',
    title: 'Quantity Range Mapping',
    action: function (params, queryParams) {
        Layout.main('PPOS_quantityRangeMapping')
    },
    breadcrumb: {
        title: 'Quantity Range Mapping',
        icon: '',
        parent: 'ppos.home'
    }

})
import '../imports/ui/pages/transferMoney'
PPOSRoutes.route('/transferMoney', {
    name: 'ppos.transferMoney',
    title: 'Transfer Money',
    action: function (params, queryParams) {
        Layout.main('PPOS_transferMoney')
    },
    breadcrumb: {
        title: 'Transfer Money',
        icon: '',
        parent: 'ppos.home'
    }

})
import '../imports/ui/pages/transferMoneyRequest'
PPOSRoutes.route('/transferMoneyRequest', {
    name: 'ppos.transferMoneyRequest',
    title: 'Transfer Money Request',
    action: function (params, queryParams) {
        Layout.main('PPOS_transferMoneyRequest')
    },
    breadcrumb: {
        title: 'Transfer Money Request',
        icon: '',
        parent: 'ppos.home'
    }

});

import '../imports/ui/pages/soPaymentTransaction'
PPOSRoutes.route('/soPaymentTransaction', {
    name: 'ppos.soPaymentTransaction',
    title: 'SO Payment Transaction',
    action: function (params, queryParams) {
        Layout.main('PPOS_soPaymentTransaction');
    },
    breadcrumb: {
        title: 'SO Payment Transaction',
        icon: '',
        parent: 'ppos.home'
    }

});
import '../imports/ui/pages/purchaseOrderPayment'
PPOSRoutes.route('/purchaseOrderPayment', {
    name: 'ppos.purchaseOrderPayment',
    title: 'PO Payment',
    action: function (params, queryParams) {
        Layout.main('PPOS_purchaseOrderPayment');
    },
    breadcrumb: {
        title: 'PO Payment',
        icon: '',
        parent: 'ppos.home'
    }

});
import '../imports/ui/pages/purchaseOrderPaymentTransaction'
PPOSRoutes.route('/purchaseOrderPaymentTransaction', {
    name: 'ppos.purchaseOrderPaymentTransaction',
    title: 'PO Payment Transaction',
    action: function (params, queryParams) {
        Layout.main('PPOS_purchaseOrderPaymentTransaction');
    },
    breadcrumb: {
        title: 'PO Payment Transaction',
        icon: '',
        parent: 'ppos.home'
    }
});
import '../imports/ui/pages/unitConvert'
PPOSRoutes.route('/unitConvert', {
    name: 'ppos.unitConvert',
    title: 'Unit Convert',
    action: function (params, queryParams) {
        Layout.main('PPOS_unitConvert');
    },
    breadcrumb: {
        title: 'Unit Convert',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/pages/print/printInvoice'
PPOSRoutes.route('/print-invoice', {
    name: 'ppos.printInvoice',
    title: 'Invoice',
    action: function (params,queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_printInvoice'});
    }
});

import '../imports/ui/pages/print/printSaleOrder'
PPOSRoutes.route('/print-sale-order', {
    name: 'ppos.printSaleOrder',
    title: 'Sale Order',
    action: function (params,queryParams) {
        BlazeLayout.render('PrintLayout', {printLayout: 'pos_printSaleOrder'});
    }
});

import '../imports/ui/pages/truck'
PPOSRoutes.route('/truck', {
    name: 'ppos.truck',
    title: 'Truck',
    action: function (params,queryParams) {
        Layout.main('PPOS_truck');
    },
    breadcrumb: {
        title: 'Truck',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/pages/advanceDiscount'
PPOSRoutes.route('/advanceDiscount', {
    name: 'ppos.advanceDiscount',
    title: 'Advance Discount',
    action: function (params,queryParams) {
        Layout.main('PPOS_advanceDiscount');
    },
    breadcrumb: {
        title: 'Advance Discount',
        icon: '',
        parent: 'ppos.home'
    }
});
import '../imports/ui/pages/tsPayment'
PPOSRoutes.route('/tsPayment', {
    name: 'ppos.tsPayment',
    title: 'TS payment',
    action: function (params,queryParams) {
        Layout.main('PPOS_tsPayment');
    },
    breadcrumb: {
        title: 'TS Payment',
        icon: '',
        parent: 'ppos.home'
    }
});
import '../imports/ui/pages/tsPaymentList'
PPOSRoutes.route('/tsPayment-list', {
    name: 'ppos.tsPaymentList',
    title: 'TS payment',
    action: function (params,queryParams) {
        Layout.main('PPOS_tsPaymentList');
    },
    breadcrumb: {
        title: 'TS Payment List',
        icon: '',
        parent: 'ppos.home'
    }
});
import '../imports/ui/pages/tsSoPayment'
PPOSRoutes.route('/tsSoPayment', {
    name: 'ppos.tsSoPayment',
    title: 'TS SO payment',
    action: function (params,queryParams) {
        Layout.main('PPOS_tsSoPayment');
    },
    breadcrumb: {
        title: 'TS SO Payment',
        icon: '',
        parent: 'ppos.home'
    }
});
import '../imports/ui/pages/tsSoPaymentList'
PPOSRoutes.route('/tsSoPayment-list', {
    name: 'ppos.tsSoPaymentList',
    title: 'TSSO List',
    action: function (params,queryParams) {
        Layout.main('PPOS_tsSoPaymentList');
    },
    breadcrumb: {
        title: 'TSSO Payment List',
        icon: '',
        parent: 'ppos.home'
    }
});
import '../imports/ui/pages/closing'
PPOSRoutes.route('/closing', {
    name: 'ppos.closing',
    title: 'Closing',
    action: function (params,queryParams) {
        Layout.main('PPOS_closing');
    },
    breadcrumb: {
        title: 'Closing',
        icon: '',
        parent: 'ppos.home'
    }
});
import '../imports/ui/pages/stockParents'
PPOSRoutes.route('/stockParents', {
    name: 'ppos.stockParents',
    title: 'Stock Parents',
    action: function (params,queryParams) {
        Layout.main('PPOS_stockParents');
    },
    breadcrumb: {
        title: 'Stock Parents',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/pages/productCycle'
PPOSRoutes.route('/product-cycle', {
    name: 'ppos.productCycle',
    title: 'Product Cycle',
    action: function (params,queryParams) {
        Layout.main('PPOS_productCycle');
    },
    breadcrumb: {
        title: 'Product Cycle',
        icon: '',
        parent: 'ppos.home'
    }
});

import '../imports/ui/pages/productCycleSetup'
PPOSRoutes.route('/product-cycle-setup', {
    name: 'ppos.productCycleSetup',
    title: 'Product Cycle Setup',
    action: function (params,queryParams) {
        Layout.main('PPOS_productCycleSetup');
    },
    breadcrumb: {
        title: 'Product Cycle Setup',
        icon: '',
        parent: 'ppos.home'
    }
});