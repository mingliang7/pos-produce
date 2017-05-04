import {Penalty} from '../../imports/api/collections/penalty.js';

// Lib
import './_init.js';

Penalty.permit(['insert'])
    .PPOS_ifSetting()
    .allowInClientCode();
Penalty.permit(['update'])
    .PPOS_ifSetting()
    .allowInClientCode();
Penalty.permit(['remove'])
    .PPOS_ifSetting()
    .allowInClientCode();
