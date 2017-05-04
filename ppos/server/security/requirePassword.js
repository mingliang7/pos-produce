import {RequirePassword} from '../../imports/api/collections/requirePassword.js';

// Lib
import './_init.js';

RequirePassword.permit(['insert'])
    .PPOS_ifSetting()
    .allowInClientCode();
RequirePassword.permit(['update'])
    .PPOS_ifSetting()
    .allowInClientCode();
RequirePassword.permit(['remove'])
    .PPOS_ifSetting()
    .allowInClientCode();
