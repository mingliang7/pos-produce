Module = typeof Module === 'undefined' ? {} : Module;

Module.PPOS = {
    name: 'PPOS System',
    version: '2.0.0',
    summary: 'Simple PPOS Management System is ...',
    roles: [
        'setting',
        'data-insert',
        'data-update',
        'data-remove',
        'reporter',
        'form-acc-payment',
        'form-acc-receive',
        'form-customer',
        'form-invoice',
        'form-group-invoice',
        'form-sale-order',
        'form-receive-payment',
        'form-so-receive-payment',
        'form-vendor',
        'form-purchase-order',
        'form-enter-bill',
        'form-pay-bill',
        'form-po-payment',
        'form-lending-stock',
        'form-tsso-payment',
        'form-ts-payment',
        'list-tsso-payment',
        'list-ts-payment',
        'list-group-bill',
        'list-pay-bill-transaction',
        'list-po-payment-transaction',
        'list-receive-payment-transaction',
        'list-so-receive-payment-transaction',
        'setting-advance-discount',
        'setting-representative',
        'setting-exchange',
        'setting-category',
        'setting-item',
        'setting-truck',
        'setting-item-price-for-customer',
        'setting-quantity-range-mapping',
        'setting-unit-convert',
        'setting-term',
        'setting-payment-group',
        'setting-credit-validation',
        'setting-white-list-customer',
        'setting-penalty',
        'setting-closing',
        'setting-unit',
        'setting-account-integration',
        'setting-stock-location-mapping',
        'setting-account-mapping'
    ],
    dump: {
        setting: [
            'PPOS_location'
        ],
        data: [
            'PPOS_customer',
            'PPOS_order'
        ]
    }
};
