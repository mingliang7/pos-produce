import {RequirePassword} from '../../imports/api/collections/requirePassword.js';

// Lib
import './_init.js';

RequirePassword.permit(['insert'])
    .Cement_ifSetting()
    .allowInClientCode();
RequirePassword.permit(['update'])
    .Cement_ifSetting()
    .allowInClientCode();
RequirePassword.permit(['remove'])
    .Cement_ifSetting()
    .allowInClientCode();
