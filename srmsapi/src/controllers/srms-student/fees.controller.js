"use strict";

const FeeController = require("../srms-school/FeeController");

const getFees = FeeController.studentFees;
const getReceipt = FeeController.studentReceipt;
const initiatePayment = FeeController.studentInitiatePayment;
const cancelPayment = FeeController.studentCancelPayment;

module.exports = { getFees, getReceipt, initiatePayment, cancelPayment };
