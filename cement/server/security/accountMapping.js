import {AccountMapping} from '../../imports/api/collections/accountMapping.js';

// Lib
import './_init.js';

AccountMapping.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
AccountMapping.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
AccountMapping.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
