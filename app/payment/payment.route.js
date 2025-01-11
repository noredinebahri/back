const router = require("express").Router();
const paymenttCtl = require("./payment.controller");
const { authenticateToken } = require("../user/auth/auth.middlware");

router.post('/save', paymenttCtl.payment);
router.post('/quickPay', paymenttCtl.quickPay);
router.get('/list/:month/:year',  paymenttCtl.paymentList);
router.post('/list',  paymenttCtl.paymentByRangeDays);
router.post('/totalSupportOnly',  paymenttCtl.totalSupportOnly);
router.get('/sumOfEachLevel',  paymenttCtl.sumOfEachLevel);
router.get('/sumOfOxygenLevel',  paymenttCtl.sumOfOxygenLevel);
router.get('/paymentsEvolution',  paymenttCtl.paymentsEvolution);
router.get('/paymentsEvolutionByRange',  paymenttCtl.paymentsEvolutionByRange);
router.post('/listNotPaid',  paymenttCtl.getStudentsNotPaidThisMonth);
router.post('/getUnpaidStudents',  paymenttCtl.getUnpaidStudents);
router.get('/listWillPaid/:month/:year',  paymenttCtl.getStudentsThisMonth);
router.get('/rightNow',  paymenttCtl.getSumOfPaymentsForCurrentMonth);
router.delete('/paymentDelete/:id/:userId', paymenttCtl.paymentDelete);
router.get('/unpaidStudents/:year/:month', paymenttCtl.unpaidStudents);
router.get('/logs', paymenttCtl.getPaymentLogs);
router.post('/sumMonth', paymenttCtl.sumMonth);
router.post('/studentPaidMonth', paymenttCtl.studentPaidMonth);
router.post('/studentNotPaidMonth', paymenttCtl.studentNotPaidMonth);
router.put('/validate-payment', paymenttCtl.validatep);
router.put('/update/:id/:userId', authenticateToken, paymenttCtl.updatePayment);
router.post('/getPvalidation', paymenttCtl.getPaymentForValidation);


module.exports = router
