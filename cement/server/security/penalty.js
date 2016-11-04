import {Penalty} from '../../imports/api/collections/penalty.js';

// Lib
import './_init.js';

Penalty.permit(['insert'])
    .Cement_ifSetting()
    .allowInClientCode();
Penalty.permit(['update'])
    .Cement_ifSetting()
    .allowInClientCode();
Penalty.permit(['remove'])
    .Cement_ifSetting()
    .allowInClientCode();
