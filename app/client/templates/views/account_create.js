const ecc = require('eosjs-ecc')
const SecureStorage = require('./../../lib/helpers/eosjs-SecureStorage/secureStorage')
/**
Template Controllers

@module Templates
*/

/**
The account create template

@class [template] views_account_create
@constructor
*/

Template['views_account_create'].onCreated(function () {
  TemplateVar.set(
    'selectedSection',
    Number(FlowRouter.getQueryParam('ownersNum')) > 0 ? 'multisig' : 'simple'
  );

  // number of owners of the account
  var walletId = FlowRouter.getQueryParam('walletId');
  var maxOwners = FlowRouter.getQueryParam('ownersNum');
  if (maxOwners && Helpers.isWatchOnly(walletId)) maxOwners++;
  TemplateVar.set('multisigSignees', maxOwners || 3);

  // number of required signatures
  TemplateVar.set(
    'multisigSignatures',
    Number(FlowRouter.getQueryParam('requiredSignatures')) || 2
  );

  // check if we are still on the correct chain
  Helpers.checkChain(function (error) {
    if (error && EthAccounts.find().count() > 0) {
      checkForOriginalWallet();
    }
  });
});

Template['views_account_create'].onRendered(function () {
  // focus the input
  this.$('input[name="accountName"]').focus();
});

Template['views_account_create'].helpers({
  /**
    Get all accounts, which can become owners.

    @method (ownerAccounts)
    */
  ownerAccounts: function () {
    var accounts = EthAccounts.find({}, { sort: { balance: -1 } }).fetch();
    accounts.sort(Helpers.sortByBalance);
    return accounts;
  },
  /**
    Return the selectedOwner

    @method (selectedOwner)
    */
  selectedOwner: function () {
    return TemplateVar.getFrom('.dapp-select-account', 'value');
  },
  /**
    Return TRUE, if the current section is selected

    @method (showSection)
    */
  showSection: function (section) {
    // reset import wallet
    TemplateVar.set('importWalletOwners', false);
    TemplateVar.set('importWalletInfo', '');

    return TemplateVar.get('selectedSection') === section;
  },
  /**
    Pick a default owner for the wallet
    @method (defaultOwner)
    @return (string)
    */
  defaultOwner: function () {
    // Load the accounts owned by user and sort by balance
    var accounts = EthAccounts.find({}, { sort: { balance: -1 } }).fetch();
    accounts.sort(Helpers.sortByBalance);

    if (FlowRouter.getQueryParam('owners')) {
      var owners = FlowRouter.getQueryParam('owners').split(',');

      // Looks for them among the wallet account owner
      var defaultAccount = _.find(accounts, function (acc) {
        return owners.indexOf(acc.address) >= 0;
      });

      return defaultAccount ? defaultAccount.address : null;
    } else {
      return accounts[0].address;
    }
  },
  /**
    Return the number of signees fields

    @method (signees)
    @return {Array} e.g. [1,2,3,4]
    */
  signees: function () {
    var owners = [];

    if (FlowRouter.getQueryParam('owners')) {
      owners = FlowRouter.getQueryParam('owners')
        .split(',')
        .slice(0, TemplateVar.get('multisigSignees'));
      owners = _.without(
        owners,
        TemplateVar.getFrom('.dapp-select-account', 'value')
      );
    }

    owners = owners.concat(
      _.range(TemplateVar.get('multisigSignees') - 1 - owners.length)
    );

    if (
      TemplateVar.get('multisigSignatures') > TemplateVar.get('multisigSignees')
    ) {
      TemplateVar.set('multisigSignatures', TemplateVar.get('multisigSignees'));
    }

    return owners;
  },
  /**
    Translates to 'owner address'

    @method (i18nOwnerAddress)
    */
  i18nOwnerAddress: function () {
    return TAPi18n.__('wallet.newWallet.accountType.multisig.ownerAddress');
  },
  /**
    Translates to 'private key'

    @method (i18nPrivateKey)
    */
  i18nPrivateKey: function () {
    return TAPi18n.__('wallet.newWallet.accountType.import.privateKey');
  },
  /**
    Returns the import info text.

    @method (importInfo)
    */
  importInfo: function () {
    var text = TemplateVar.get('importWalletInfo'),
      owners = TemplateVar.get('importWalletOwners');

    if (!text) {
      return '';
    } else {
      if (owners) return '<i class="icon-check"></i> ' + text;
      else return '<i class="icon-close"></i> ' + text;
    }
  },
  /**
    Returns the class valid for valid addresses and invalid for non wallet addresses.

    @method (importValidClass)
    */
  importValidClass: function () {
    return TemplateVar.get('importWalletOwners') ? 'valid' : 'invalid';
  },
  /**
    Get the number of required multisignees (account owners)

    @method (multisigSignees)
    */
  multisigSignees: function () {
    var id = FlowRouter.getQueryParam('walletId');
    var maxOwners = FlowRouter.getQueryParam('ownersNum');
    if (maxOwners && Helpers.isWatchOnly(id)) maxOwners++;
    maxOwners = Math.max(maxOwners || 7, 7);

    var returnArray = [];
    for (i = 2; i <= maxOwners; i++) {
      returnArray.push({ value: i, text: i });
    }
    return returnArray;
  },
  /**
    Get the number of required multisignatures

    @method (multisigSignatures)
    */
  multisigSignatures: function () {
    var signees = TemplateVar.get('multisigSignees');
    var returnArray = [];

    for (i = 2; i <= signees; i++) {
      returnArray.push({ value: i, text: i });
    }

    return returnArray;
  },
  /**
    Is simple checked

    @method (simpleCheck)
    */
  simpleCheck: function () {
    return TemplateVar.get('selectedSection') === 'simple' ? 'checked' : '';
  },
  /**
    Is multisig checked

    @method (multisigCheck)
    */
  multisigCheck: function () {
    return TemplateVar.get('selectedSection') === 'multisig' ? 'checked' : '';
  },
  /**
    Default dailyLimit

    @method (defaultDailyLimit)
    */
  defaultDailyLimit: function () {
    var dailyLimit = FlowRouter.getQueryParam('dailyLimit');
    return typeof dailyLimit != 'undefined'
      ? web3.utils.fromWei(dailyLimit.toString(), 'eos')
      : 10;
  },
  /**
    Default Name

    @method (name)
    */
  name: function () {
    return FlowRouter.getQueryParam('name');
  },

  errMsg: function () {
    return TemplateVar.get('errMsg');
  }
});

Template['views_account_create'].events({
  /**
    Check the owner of the imported wallet.
    
    @event change input.import, input input.import
    */
  'change input.import, input input.import': function (e, template) {
    checkWalletOwners(e.currentTarget.value).then(
      function (wallet) {
        TemplateVar.set(template, 'importWalletOwners', wallet.owners);
        TemplateVar.set(template, 'importWalletInfo', wallet.info);
        return null;
      },
      function () { }
    );
  },
  /**
    Check the owner that its not a contract wallet
    
    @event change input.owners, input input.owners
    */
  'change input.owners, input input.owners': function (e, template) {
    var address = TemplateVar.getFrom(e.currentTarget, 'value');
  },
  /**
    Select the current section, based on the radio inputs value.

    @event change input[type="radio"]
    */
  'change input[type="radio"]': function (e) {
    TemplateVar.set('selectedSection', e.currentTarget.value);
  },
  /**
    Change the number of signatures

    @event click span[name="multisigSignatures"] .simple-modal button
    */
  'click span[name="multisigSignatures"] .simple-modal button': function (e) {
    TemplateVar.set('multisigSignatures', $(e.currentTarget).data('value'));
  },
  /**
    Change the number of signees

    @event click span[name="multisigSignees"] .simple-modal button
    */
  'click span[name="multisigSignees"] .simple-modal button': function (e) {
    TemplateVar.set('multisigSignees', $(e.currentTarget).data('value'));
  },

  /**
    Create the account

    @event submit
    */
  submit: function (e, template) {
    var code = walletStubABI; // walletStubABI 184 280 walletABI ~1 842 800
    var type = TemplateVar.get('selectedSection');

    // SIMPLE
    if (type === 'simple') {
      // Wallets.insert({
      //   deployFrom: null,
      //   owners: [deployFrom],
      //   name:
      //     template.find('input[name="accountName"]').value ||
      //     TAPi18n.__('wallet.accounts.defaultName'),
      //   balance: '0',
      //   creationBlock: EthBlocks.latest.number,
      //   code: code
      // });
      // Open a modal showing the QR Code
      let accountName = template.find('input[name="accountName"]').value;
      let password = template.find('input[name="password"]').value;

      eos.getAccount(accountName).then(account => {
        TemplateVar.set(template, 'errMsg', "error.existsAccount");
      }, err => {
        ecc.randomKey().then(privateKey => {
          // storage private key
          const storage = new SecureStorage.default({id:'EOS_ACCOUNT'})
          storage.set(accountName, privateKey, password)

          EthElements.Modal.show({
            template: 'generateKey',
            data: {
              accountName: accountName,
              keys: {
                publicKey: ecc.privateToPublic(privateKey),
                privateKey
              }
            }
          }, {
            class: 'modal-medium'
          });
        })
      })

      //FlowRouter.go('dashboard');
    }

    // IMPORT
    if (type === 'import') {
      // var owners = _.uniq(
      //   _.compact(
      //     _.map(TemplateVar.get('importWalletOwners'), function (item) {
      //       if (web3.utils.isAddress(item)) return item.toLowerCase();
      //     })
      //   )
      // );

      // if (owners.length === 0) return;

      // var address = template.find('input.import').value;
      // address = '0x' + address.replace('0x', '').toLowerCase();
      // if (Wallets.findOne({ address: address }))
      //   return GlobalNotification.warning({
      //     content: 'i18n:wallet.newWallet.error.alreadyExists',
      //     duration: 2
      //   });

      // // reorganize owners, so that yourself is at place one
      // var account = Helpers.getAccountByAddress({ $in: owners || [] });
      // if (account) {
      //   owners = _.without(owners, account.address);
      //   owners.unshift(account.address);
      // }

      // Wallets.insert({
      //   owners: owners,
      //   name:
      //     template.find('input[name="accountName"]').value ||
      //     TAPi18n.__('wallet.accounts.defaultName'),
      //   address: address,
      //   balance: '0',
      //   // TODO set to 0
      //   creationBlock: 300000,
      //   imported: true
      // });

      // FlowRouter.go('dashboard');

      let password = template.find('input[name="password"]').value;
      let privateKey = template.find('input[name="privateKey"]').value;
      let publicKey = ecc.privateToPublic(privateKey)

      eos.getKeyAccounts(publicKey).then(accounts => {
        EthElements.Modal.show({
          template: 'importKey',
          data: {
            accounts: accounts
          }
        });
      })
    }
  }
});
