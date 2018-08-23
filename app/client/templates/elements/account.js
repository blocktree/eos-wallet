const keystore = require("../../lib/eos/keystore");
/**
Template Controllers

@module Templates
*/

/**
The account template

@class [template] elements_account
@constructor
*/

Template.elements_account.created = function() {
  let self = this
  let name = this.data.name
  TemplateVar.set(self, 'account_name', name)
  eos.getAccount(name).then(account => {
    account.creating = false;
    let item = keystore.Get(name)
    account.publicKey = item.publicKey;
    TemplateVar.set(self, 'account', account)
  }, err => {
    //
    let item = keystore.Get(name)
    TemplateVar.set(self, 'account', {creating: true, account_name: name, publicKey: item.publicKey})
  })
  eos.getCurrencyBalance('eosio.token', name).then(res => {
      TemplateVar.set(self, 'balance', res);
    }, err => {
    //console.log(err)
  })
};

Template.elements_account.rendered = function() {
  // initiate the geo pattern
  var pattern = GeoPattern.generate(this.data.name);
  this.$('.account-pattern').css('background-image', pattern.toDataUrl());
};

Template.elements_account.helpers({
  /**
    Get the current account

    @method (account)
    */
  account: function() {
    let account = TemplateVar.get('account')
    return account;
  },
  /**
    Get the tokens balance

    @method (formattedTokenBalance)
    */
  formattedTokenBalance: function(e) {
    var balance = TemplateVar.get('balance'); 
    if(balance.length === 0) 
      balance = ["0.0000 EOS"]
    return balance[0];

    // var account = Template.parentData(2);

    // return this.balances && Number(this.balances[account._id]) > 0
    //   ? Helpers.formatNumberByDecimals(
    //       this.balances[account._id],
    //       this.decimals
    //     ) +
    //       ' ' +
    //       this.symbol
    //   : false;
  },
  /**
    Account was just added. Return true and remove the "new" field.

    @method (new)
    */
  new: function() {
    if (this.new) {
      // remove the "new" field
      var id = this._id;
      Meteor.setTimeout(function() {
        EthAccounts.update(id, { $unset: { new: '' } });
        Wallets.update(id, { $unset: { new: '' } });
        CustomContracts.update(id, { $unset: { new: '' } });
      }, 1000);

      return true;
    }
  },
  /**
    Displays ENS names with triangles
    @method (nameDisplay)
    */
  displayName: function() {
    return this.account_name;
  },
  /**
    Adds class about ens
    @method (ensClass)
    */
  ensClass: function() {
    return this.ens ? 'ens-name' : 'not-ens-name';
  }
});

Template.elements_account.events({
  /**
    Field test the speed wallet is rendered

    @event click button.show-data
    */
  'click .wallet-box': function(e) {
    console.time('renderAccountPage');
  }
});
