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
