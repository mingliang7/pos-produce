export const AccountIntegrationSetting = new Mongo.Collection('cement_accountIntegrationSetting');

AccountIntegrationSetting.schema = new SimpleSchema({
  integrate: {
    type: Boolean,
    optional: true
  },
});


AccountIntegrationSetting.attachSchema(AccountIntegrationSetting.schema);
