Module = typeof Module === 'undefined' ? {} : Module;

Module.Cement = {
    name: 'POS System',
    version: '2.0.0',
    summary: 'Simple POS Management System is ...',
    roles: [
        'setting',
        'data-insert',
        'data-update',
        'data-remove',
        'reporter'
    ],
    dump: {
        setting: [
            'cement_location'
        ],
        data: [
            'cement_customer',
            'cement_order'
        ]
    }
};
