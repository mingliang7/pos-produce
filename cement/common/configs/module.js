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
        'reporter'
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
