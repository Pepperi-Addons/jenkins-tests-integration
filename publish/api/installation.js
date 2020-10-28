'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The erroeMessage is importent! it will be written in the audit log and help the user to understand what happen
*/


var install = async (Client, Request) => {
    return {success:true}
};
var uninstall = async (Client, Request) => {
    return {success:true}
};
var upgrade = async (Client, Request) => {
    return {success:true}
};
var downgrade = async (Client, Request) => {
    return {success:true}
};

var installation = {
	install: install,
	uninstall: uninstall,
	upgrade: upgrade,
	downgrade: downgrade
};

exports.default = installation;
exports.downgrade = downgrade;
exports.install = install;
exports.uninstall = uninstall;
exports.upgrade = upgrade;
