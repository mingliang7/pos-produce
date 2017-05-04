import {AccountMapping} from '../../imports/api/collections/accountMapping.js';

// Lib
import './_init.js';

AccountMapping.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
AccountMapping.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
AccountMapping.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
