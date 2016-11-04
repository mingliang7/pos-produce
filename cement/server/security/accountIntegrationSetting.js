import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';

// Lib
import './_init.js';

AccountIntegrationSetting.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
AccountIntegrationSetting.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
AccountIntegrationSetting.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
