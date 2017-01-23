Module = typeof Module === 'undefined' ? {} : Module;

Module.Cement = {
    name: 'CEMENT System',
    version: '2.0.0',
    summary: 'Simple CEMENT Management System is ...',
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
        'setting-unit',
        'setting-account-integration',
        'setting-stock-location-mapping',
        'setting-account-mapping'
    ],
    dump: {
        setting: [
            'Cement_location'
        ],
        data: [
            'Cement_customer',
            'Cement_order'
        ]
    }
};
