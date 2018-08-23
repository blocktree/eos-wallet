/**
The template to display qrCode.

@class [template] views_modals_qrCode
@constructor
*/

Template["generateKey"].onRendered(function() {
  if (this.data && this.data.keys) {
    this.find('input[name="accountName"]').value = this.data.accountName;
    this.find(
      'input[name="publicKey"]'
    ).value = this.data.keys.publicKey;
    this.find(
      'input[name="privateKey"]'
    ).value = this.data.keys.privateKey;
  }
});

Template["generateKey"].events({
  /**
      back to dashboard
    */
  'click button.dapp-block-button[name="btn_back"]': function(e) {
    FlowRouter.go("dashboard", { new: this.accountName });
  }
});
