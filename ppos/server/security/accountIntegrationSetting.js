import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';

// Lib
import './_init.js';

AccountIntegrationSetting.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
AccountIntegrationSetting.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
AccountIntegrationSetting.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
