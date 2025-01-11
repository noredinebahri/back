require("dotenv").config();
const Student = require("../student/student.model");
const Payment = require("./payment.model");
const Level = require("../level/level.model");
const Absence = require("../absence/absence.model");
const axios = require("axios");
const PaymentLog = require("../logs/payment_log");
const User = require("../user/auth/auth.model"); // Assuming you have a user model
const { Op, literal, sequelize } = require("sequelize");
const Sequelize = require("../../params/db");
const { emailTemplate, processNotification } = require('../notification/notification.service');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const QRCode = require('qrcode');

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const pdfToPrinter = require('pdf-to-printer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "baritof@gmail.com",
    pass: "chqk rdyv bbgu ggul"
  }
});
const getMonthName = (date) => {
  const date2 = new Date(date); // 2009-11-10
  const month = date2.toLocaleString("default", { month: "long" });
  return month;
};
exports.validatep = async (req, res) => {
  const { paymentId, isValidated, paymentDate } = req.body;
  try {
    const payment = await Payment.findOne({ where: { id: paymentId } });
    if (payment) {
      payment.rejected = isValidated; // Assurez-vous que ce champ existe dans votre modèle
      await payment.save({ updatedAt: paymentDate, rejected: isValidated });
      res.json({ message: "Payment updated successfully", success: true });
    } else {
      res.status(404).json({ message: "Payment not found", success: false });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating payment",
      error: error.message,
      success: false,
    });
  }
};
exports.getPaymentForValidation = async (req, res) => {
  try {
    let { paymentDate, isValidated } = req.body;
    if (!paymentDate || paymentDate.length === 0) {
      const today = new Date();
      paymentDate = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDate()}`;
    }
    const isRejected = isValidated ? parseInt(isValidated, 10) === 1 : 0;
    const payments = await Payment.findAll({
      where: {
        paymentDate: new Date(paymentDate),
        rejected: isRejected, // Assurez-vous que cette condition correspond à votre logique métier
      },
      include: [
        { model: Student }, // Incluez le modèle Student si vous avez une relation et souhaitez inclure ces données
      ],
    });

    res.status(200).json({ data: payments, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      error: error.message,
      success: false,
    });
  }
};
const getStudent = async (studentId) => {
  try {
    return await Student.findByPk(studentId);
  } catch (error) {
    throw new Error("Student not found");
  }
};
const getlevel = async (levelId) => {
  try {
    return await Level.findByPk(levelId);
  } catch (error) {
    throw new Error("level not found");
  }
};
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Center Notifications" <baritof@gmail.com>',
      to,
      subject,
      html, // Send HTML content instead of plain text
    });
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
const RESTART_SPOOLER_BAT_PATH = "../../spooler.bat";

exports.payment = async (req, res) => {
  try {
    const { paymentDate, studentId, userId } = req.body;
    const paymentDateObj = new Date(paymentDate);
    const month = paymentDateObj.getMonth() + 1;
    const year = paymentDateObj.getFullYear();

    const found = await Sequelize.query(
      "SELECT id FROM payments WHERE month(paymentDate) = ? AND studentId = ? AND year(paymentDate) = ?",
      {
        replacements: [month, studentId, year],
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (found.length > 0) {
      return res
        .status(409)
        .json({ success: false, reason: "exist", payload: found });
    }

    const data = await Payment.create(req.body);
    console.log(req.body);
    console.log(data.id);

    await logPaymentAction("CREATE", data.id, userId, req.body);

    const student = await getStudent(studentId);
    const level = await getlevel(req.body.levelId);

    // Generate the PDF
    await clearPrintQueue();
    const filePath = await generatePaymentPDF(student, req.body, level);
    await restartPrintSpooler();
    await printPDF(filePath);
w
    // Send data to the external API
    // await axios.post('https://api.cossli.com/api/v1/payment/save', data);

    res.status(201).json({ success: true, payload: data });
  } catch (error) {
    res.status(404).json({ success: false, reason: error.message });
  }
};
const generatePaymentPDF = async (student, paymentData, level) => {
  const pageWidth = 4.5 * 28.35; // 4.5 cm in points
  const pageHeight = 600; // Adjust as needed for content length
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const { height } = page.getSize();
  const fontSizeTitle = 15; // Smaller font size for narrow paper
  const fontSizeText = 8;
  const lineSpacing = 12;

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Generate QR code data
  const qrCodeData = `Student ID: ${student.id}\n`;

  // Generate QR code image
  const qrCodeImageBuffer = await QRCode.toBuffer(qrCodeData, {
    width: 100,
    margin: 2,
  });

  // Embed the QR code image in the PDF
  const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBuffer);
  const qrCodeImageDims = qrCodeImage.scale(0.5); // Adjust scale if needed

  // Draw the QR code at the top
  page.drawImage(qrCodeImage, {
    x: 10,
    y: height - qrCodeImageDims.height - 10,
    width: qrCodeImageDims.width,
    height: qrCodeImageDims.height,
  });

  // Draw the rest of the text content below the QR code
  page.drawText("Centre Oxygène", {
    x: 10,
    y: height - qrCodeImageDims.height - 30,
    size: fontSizeTitle,
    font: boldFont,
  });

  // Date
  page.drawText(`Date : ${new Date().toLocaleString("fr-FR")}`, {
    x: 10,
    y: height - qrCodeImageDims.height - 50,
    size: fontSizeText,
    font: font,
  });

  // Calculate the next payment date (1 month later)
  const paymentDate = new Date(paymentData.paymentDate);
  const nextPaymentDate = new Date(paymentDate);
  nextPaymentDate.setMonth(paymentDate.getMonth() + 1);
  // Student information
  page.drawText("Informations sur l'étudiant :", {
    x: 10,
    y: height - qrCodeImageDims.height - 70,
    size: fontSizeText,
    font: boldFont,
  });
  page.drawText(`Nom & Prénom : ${student.firstname} ${student.lastname}`, {
    x: 10,
    y: height - qrCodeImageDims.height - 85,
    size: fontSizeText,
    font: font,
  });
  page.drawText(`ID : ${student.id}`, {
    x: 10,
    y: height - qrCodeImageDims.height - 100,
    size: fontSizeText,
    font: font,
  });

  // Payment information
  page.drawText("Informations de paiement :", {
    x: 10,
    y: height - qrCodeImageDims.height - 115,
    size: fontSizeText,
    font: boldFont,
  });
  page.drawText(`Paiement le mois : ${getMonthName(paymentData.paymentDate)}`, {
    x: 10,
    y: height - qrCodeImageDims.height - 125,
    size: fontSizeText,
    font: font,
  });
  page.drawText(`Prix : ${paymentData.price} DH`, {
    x: 10,
    y: height - qrCodeImageDims.height - 135,
    size: fontSizeText,
    font: font,
  });
  page.drawText(`Reste : ${paymentData.rest} DH`, {
    x: 10,
    y: height - qrCodeImageDims.height - 150,
    size: fontSizeText,
    font: font,
  });
  page.drawText(`Prix total : ${student.priceTotal} DH`, {
    x: 10,
    y: height - qrCodeImageDims.height - 165,
    size: fontSizeText,
    font: font,
  });
  page.drawText(`Prochaine: ${nextPaymentDate.toLocaleDateString("fr-FR")}`, {
    x: 10,
    y: height - qrCodeImageDims.height - 180,
    size: fontSizeText,
    font: font,
  });

  // Level information
  page.drawText("Informations sur le niveau :", {
    x: 10,
    y: height - qrCodeImageDims.height - 200,
    size: fontSizeText,
    font: boldFont,
  });
  page.drawText(`Niveau : ${level.name}`, {
    x: 10,
    y: height - qrCodeImageDims.height - 215,
    size: fontSizeText,
    font: font,
  });
  page.drawText(`ID de niveau : ${level.id}`, {
    x: 10,
    y: height - qrCodeImageDims.height - 230,
    size: fontSizeText,
    font: font,
  });
  page.drawText("WhatsApp : 0633030117", {
    x: 10,
    y: height - qrCodeImageDims.height - 240,
    size: fontSizeText,
    font: boldFont,
  });
  page.drawText("téléphone fixe : 0530209587", {
    x: 10,
    y: height - qrCodeImageDims.height - 250,
    size: fontSizeText,
    font: boldFont,
  });
  page.drawText("_________________________", {
    x: 10,
    y: height - qrCodeImageDims.height - 265,
    size: fontSizeText,
    font: boldFont,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(
    __dirname,
    "receipts",
    `payment_${Date.now()}.pdf`
  );

  if (!fs.existsSync(path.join(__dirname, "receipts"))) {
    fs.mkdirSync(path.join(__dirname, "receipts"));
  }
  fs.writeFileSync(filePath, pdfBytes);

  return filePath;
};

// const generatePaymentPDF = async (student, paymentData, level) => {
//   // 4.5 cm in points (1 cm = 28.35 points)
//   const pageWidth = 4.5 * 28.35; // Convert cm to points
//   const pageHeight = 600; // Adjust as needed for content length
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([pageWidth, pageHeight]);

//   const { height } = page.getSize();
//   const fontSizeTitle = 15; // Smaller font size for narrow paper
//   const fontSizeText = 8;
//   const lineSpacing = 12;

//   // Load fonts
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   page.drawText('Centre Oxygène', {
//     x: 10,
//     y: height - 30,
//     size: fontSizeTitle,
//     font: boldFont,
//     color: rgb(0, 0.53, 0.71),
// });

// // Date
// page.drawText(`Date : ${new Date().toLocaleString('fr-FR')}`, {
//     x: 10,
//     y: height - 50,
//     size: fontSizeText,
//     font: font,
// });

// // Informations sur l'étudiant
// page.drawText('Informations sur l\'étudiant :', {
//     x: 10,
//     y: height - 70,
//     size: fontSizeText,
//     font: boldFont,
// });
// page.drawText(`Nom & Prénom : ${student.firstname} ${student.lastname}`, {
//     x: 10,
//     y: height - 85,
//     size: fontSizeText,
//     font: font,
// });
// page.drawText(`ID : ${student.id}`, {
//     x: 10,
//     y: height - 100,
//     size: fontSizeText,
//     font: font,
// });

// // Informations de paiement
// page.drawText('Informations de paiement :', {
//     x: 10,
//     y: height - 115,
//     size: fontSizeText,
//     font: boldFont,
// });
// page.drawText(`Paiement le mois : ${getMonthName(paymentData.paymentDate)}`, {
//     x: 10,
//     y: height - 125,
//     size: fontSizeText,
//     font: font,
// });
// page.drawText(`Prix : ${paymentData.price} DH`, {
//     x: 10,
//     y: height - 135,
//     size: fontSizeText,
//     font: font,
// });
// page.drawText(`Reste : ${paymentData.rest} DH`, {
//     x: 10,
//     y: height - 150,
//     size: fontSizeText,
//     font: font,
// });
// page.drawText(`Prix total : ${student.priceTotal} DH`, {
//     x: 10,
//     y: height - 165,
//     size: fontSizeText,
//     font: font,
// });

// // Informations sur le niveau
// page.drawText('Informations sur le niveau :', {
//     x: 10,
//     y: height - 185,
//     size: fontSizeText,
//     font: boldFont,
// });
// page.drawText(`Niveau : ${level.name}`, {
//     x: 10,
//     y: height - 200,
//     size: fontSizeText,
//     font: font,
// });
// page.drawText(`ID de niveau : ${level.id}`, {
//     x: 10,
//     y: height - 215,
//     size: fontSizeText,
//     font: font,
// });
// page.drawText('WhatsApp : 0633030117', {
//     x: 10,
//     y: height - 225,
//     size: fontSizeText,
//     font: boldFont,
// });
// page.drawText('téléphone fixe : 0530209587', {
//     x: 10,
//     y: height - 235, // Adjusted position for the second number
//     size: fontSizeText,
//     font: boldFont,
// });
// page.drawText('_________________________', {
//   x: 10,
//   y: height - 250, // Adjusted position for the second number
//   size: fontSizeText,
//   font: boldFont,
// });

//   const pdfBytes = await pdfDoc.save();
//   const filePath = path.join(__dirname, 'receipts', `payment_${Date.now()}.pdf`);

//   if (!fs.existsSync(path.join(__dirname, 'receipts'))) {
//     fs.mkdirSync(path.join(__dirname, 'receipts'));
//   }
//   fs.writeFileSync(filePath, pdfBytes);

//   return filePath;
// };
const clearPrintQueue = () => {
  return new Promise((resolve, reject) => {
    exec("del /Q %SystemRoot%\\System32\\spool\\PRINTERS\\*", (err) => {
      if (err) {
        console.error("Error clearing the print queue:", err);
        return reject(err);
      }
      console.log("Print queue cleared successfully.");
      resolve();
    });
  });
};
const restartPrintSpooler = () => {
  exec('schtasks /run /tn "Restart Print Spooler"', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running task: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    console.log("Print spooler task triggered successfully");
  });
};

const printPDF = async (filePath) => {
  try {
    // Print the PDF using pdf-to-printer
    await pdfToPrinter.print(filePath, { printer: 'POS58 Printer' }); // Replace with your printer name
    console.log('PDF successfully sent to the printer.');

    // Optionally delete the file after printing
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting the file:', err);
      } else {
        console.log('File successfully deleted:', filePath);
      }
    });
  } catch (err) {
    console.error('Failed to print the PDF:', err);
    throw err;
  }
};

exports.getUnpaidStudents = async () => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  try {
    const unpaidStudents = await Student.findAll({
      include: [
        {
          model: Payment,
          where: {
            paymentDate: {
              [Op.gte]: firstDayOfMonth,
            },
            rejected: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.eq]: 0,
              },
            },
          },
          required: false, // Use left join to include students without payments
        },
      ],
    });

    return unpaidStudents;
  } catch (error) {
    throw error;
  }
};

exports.quickPay = (req, res) => {
  console.log(req.body);
  const { year, month, day, studentId } = req.body;
  const id = req.body.userId;
  const price = req.body.price;

  Sequelize.query(
    `SELECT * FROM payments where month(paymentDate) = ${month} and studentId = ${id} and year(paymentDate) = ${year}`,
    {
      type: Sequelize.QueryTypes.SELECT,
    }
  )
    .then((found) => {
      console.log(found);
      if (found.length > 0) {
        res.status(301).json({
          success: false,
          reason: "exist",
          payload: found,
        });
      } else {
        const newDate = `${year}-${month}-${day}`;
        let payload = {
          paymentDate: newDate,
          studentId: studentId,
          price,
        };
        Payment.create(payload)
          .then((data) => {
            console.log(data);
            res.status(201).json({
              success: true,
              payload: data,
            });
          })
          .catch((error) => {
            res.status(404).json({
              success: false,
              reason: error,
            });
          });
      }
    })
    .catch((error) => {
      res.status(404).json({
        success: false,
        reason: error,
      });
    });
};
exports.sumMonth = async (req, res) => {
  try {
    const { month, year } = req.body;
    const sum = Student.findAll({
      include: [
        {
          model: Level,
        },
        {
          model: Payment,
          required: false,
        },
      ],
      where: {
        actif: true,
        [Sequelize.Op.and]: [
          Sequelize.where(
            Sequelize.fn("month", Sequelize.col("payment.paymentDate")),
            month
          ),
          Sequelize.where(
            Sequelize.fn("year", Sequelize.col("payment.paymentDate")),
            year
          ),
        ],
      },
    });
    // const sum = await Sequelize.query(
    //   `SELECT s.*, p.*
    //   FROM students AS s
    //   INNER JOIN levels AS l ON l.id = s.levelId
    //   LEFT JOIN payments AS p ON p.studentId = s.id
    //   WHERE s.actif = 1 AND MONTH(p.paymentDate) = ${month}
    //   AND YEAR(p.paymentDate) = ${year}`,
    //   {
    //     type: Sequelize.QueryTypes.SELECT,
    //   }
    // );
    res.status(200).json(sum);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.studentPaidMonth = async (req, res) => {
  try {
    const { month, year } = req.body;
    const studentsPaid = await Sequelize.query(
      `SELECT *
      FROM students AS s
      INNER JOIN levels AS l ON l.id = s.levelId
      LEFT JOIN payments AS p ON p.studentId = s.id
      WHERE  MONTH(p.paymentDate) = ${month}
      AND YEAR(p.paymentDate) = ${year}`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(studentsPaid);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.studentNotPaidMonth = async (req, res) => {
  try {
    const { month, year } = req.body;
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    const studentsNotPaid = await Sequelize.query(
      `SELECT 
    l.id AS idlevel,
    s.firstname,
    s.lastname,
    s.id_center,
    s.createdAt,
    l.name AS levelName,
    s.id,
    p.price,
    s.levelId,
    s.discount,
    s.rejected
FROM 
    students AS s
INNER JOIN 
    levels AS l ON l.id = s.levelId
LEFT JOIN 
    payments AS p ON p.studentId = s.id
        AND MONTH(p.paymentDate) = ${month}
        AND YEAR(p.paymentDate) = ${year}
WHERE 
 isFree="non" 
    AND (MONTH(p.paymentDate) IS NULL OR p.paymentDate IS NULL)
`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(studentsNotPaid);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.getStudentsNotPaidThisMonth = async (req, res) => {
  try {
    const { month, year, only } = req.body;
    // Get the last day of the given month
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const studentOnlyPaid =
      only === 0
        ? `AND (p.paymentDate IS NULL OR (p.paymentDate < '${year}-${month}-01' OR p.paymentDate > '${year}-${month}-${lastDayOfMonth}'))`
        : ``;
    const students = await Sequelize.query(
      `SELECT l.id as idlevel,s.firstname, s.lastname, p.price, l.name AS levelName, s.id, s.levelId, s.discount, s.rejected, p.paymentDate
      FROM students AS s
      INNER JOIN levels AS l ON l.id = s.levelId
      LEFT JOIN payments AS p ON p.studentId = s.id
      WHERE  MONTH(p.paymentDate) = ${month} AND YEAR(p.paymentDate) = ${year}`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    // Organize students into categories based on level name and calculate totals
    const categorizedStudents = {};
    let totalStudents = 0;
    let totalPriceAllLevels = 0;

    students.forEach((student) => {
      const levelName = student.levelName;
      const discountedPrice = student.price - student.discount;

      if (!categorizedStudents[levelName]) {
        categorizedStudents[levelName] = {
          students: [],
          total: 0,
          levelName: 0,
          totalPrice: 0,
        };
      }
      categorizedStudents[levelName].students.push(student);
      categorizedStudents[levelName].total++;
      categorizedStudents[levelName].levelName = levelName;
      categorizedStudents[levelName].totalPrice += discountedPrice;

      totalStudents++;
      totalPriceAllLevels += discountedPrice;
    });

    // Include total students, total price in all levels, categorized students, and total price in each level in the response
    res.status(200).json({
      success: true,
      students: students.reduce((sum, student) => sum + student.price, 0),
      totalStudents: totalStudents,
      totalPriceAllLevels: totalPriceAllLevels,
      data: categorizedStudents,
    });
  } catch (error) {
    // Handle error
    res.status(500).json({ success: false, error: error });
  }
};
exports.getStudentsThisMonth = async (req, res) => {
  try {
    const { month, year } = req.params;

    // Get the last day of the given month
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    const students = await Sequelize.query(
      `SELECT l.id as idlevel,s.firstname, s.lastname, l.price, l.name AS levelName, s.id, s.levelId, s.discount, s.rejected, p.paymentDate
      FROM students AS s
      INNER JOIN levels AS l ON l.id = s.levelId
      LEFT JOIN payments AS p ON p.studentId = s.id
                             AND MONTH(p.paymentDate) = ${month}
                             AND YEAR(p.paymentDate) = ${year}
     `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    // Organize students into categories based on level name and calculate totals
    const categorizedStudents = {};
    let totalStudents = 0;
    let totalPriceAllLevels = 0;

    students.forEach((student) => {
      const levelName = student.levelName;
      const discountedPrice = student.price - student.discount;

      if (!categorizedStudents[levelName]) {
        categorizedStudents[levelName] = {
          students: [],
          total: 0,
          totalPrice: 0,
        };
      }
      categorizedStudents[levelName].students.push(student);
      categorizedStudents[levelName].total++;
      categorizedStudents[levelName].totalPrice += discountedPrice;

      totalStudents++;
      totalPriceAllLevels += discountedPrice;
    });

    // Include total students, total price in all levels, categorized students, and total price in each level in the response
    res.status(200).json({
      success: true,
      totalStudents: totalStudents,
      totalPriceAllLevels: totalPriceAllLevels,
      data: categorizedStudents,
    });
  } catch (error) {
    // Handle error
    res.status(500).json({ success: false, error: "An error occurred" });
  }
};
exports.paymentList = async (req, res) => {
  try {
    const { month, year } = req.params;
    // and year(p.paymentDate) = ${year}`
    const result = await Sequelize.query(
      `select s.*,l.*,p.*  
      from payments as p 
      inner join students as s on p.studentId = s.id 
      inner join levels as l on l.id = s.levelId 
      where  month(p.paymentDate) = ${month} and year(p.paymentDate) = ${year} order by p.paymentDate desc`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    result.map((x) => {
      x.private_token = null;
      x.password = null;
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};
exports.paymentByRangeDays = async (req, res) => {
  try {
    const { start, end } = req.body;
    const trimmedStart = start.trim();
    const trimmedEnd = end.trim();

    if (start && end) {
      const result = await Sequelize.query(
        `select s.*,l.*,p.*  
        from payments as p 
        inner join students as s on p.studentId = s.id 
        inner join levels as l on l.id = s.levelId 
        where isFree = 'non' and p.paymentDate between '${trimmedStart}' and '${trimmedEnd}'`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      );
      result.map((x) => {
        x.private_token = null;
        x.password = null;
      });
      res.status(200).json(result);
    } else {
      res.status(404).json({ alert: "the date empty or error format" });
    }
  } catch (error) {
    res.status(404).json({ error: error });
  }
};
exports.getPaymentLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortField = "timestamp",
      sortOrder = "DESC",
      filter = {},
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};

    // Apply filters if any
    if (filter.action) {
      whereClause.action = filter.action;
    }
    if (filter.userId) {
      whereClause.userId = filter.userId;
    }
    if (filter.paymentId) {
      whereClause.paymentId = filter.paymentId;
    }

    const logs = await PaymentLog.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, attributes: ["id", "firstname", "lastname"] },
        { model: Payment, attributes: ["id", "price"] },
      ],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: logs.rows,
      total: logs.count,
      page: parseInt(page),
      pages: Math.ceil(logs.count / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payment logs", error: error.message });
  }
};
exports.paymentDelete = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await logPaymentAction("DELETE", id, userId, {});
    const result = await Payment.destroy({ where: { id: id } });

    if (result == 1) {
      res.status(202).json({ success: true });
    }
  } catch (error) {
    res.status(404).json({ success: false, raison: error });
  }
};
exports.getUnpaidStudents = async (req, res) => {
  let { startDay, endDay, month, year } = req.body;

  // If startDay or endDay is not a number, set them to the first and last day of the month
  if (typeof startDay !== "number") {
    startDay = 1;
  }

  if (typeof endDay !== "number") {
    const currentDate = new Date();
    endDay = new Date(
      year || currentDate.getFullYear(),
      month !== undefined ? month : currentDate.getMonth() + 1,
      0
    ).getDate();
  }

  const startDate = new Date(
    Date.UTC(
      year || new Date().getFullYear(),
      month !== undefined ? month - 1 : new Date().getMonth(),
      startDay,
      0,
      0,
      0,
      0
    )
  );
  const endDate = new Date(
    Date.UTC(
      year || new Date().getFullYear(),
      month !== undefined ? month - 1 : new Date().getMonth(),
      endDay,
      23,
      59,
      59,
      999
    )
  );

  try {
    const unpaidStudents = await Student.findAll({
      include: [
        {
          model: Payment,
          where: {
            paymentDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          required: false,
        },
      ],
      where: {
        "$payments.id$": { [Op.eq]: null }, // Check if there are no payments
      },
    });
    res.status(200).json({ total: unpaidStudents.lengtH, unpaidStudents });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSumOfPaymentsForCurrentMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const sumOfPayments = await Payment.sum("price", {
      where: {
        paymentDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    res.status(200).json({ sumOfPayments });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

getDifference = (a, b) => {
  return a.filter((element) => {
    return !b.includes(element);
  });
};

exports.paymentsEvolution = async (req, res) => {
  try {
    // Group payments by month and year to get the count of payments for each month
    const paymentEvolution = await Payment.findAll({
      attributes: [
        [Sequelize.fn("YEAR", Sequelize.col("paymentDate")), "year"],
        [Sequelize.fn("MONTH", Sequelize.col("paymentDate")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "paymentCount"],
      ],
      group: ["year", "month"],
    });

    res.status(200).json({ paymentEvolution });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.unpaidStudents = async (req, res) => {
  try {
    const { year, month } = req.params;
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);

    if (isNaN(parsedYear) || isNaN(parsedMonth)) {
      return res.status(400).json({ error: "Invalid year or month provided." });
    }

    const currentYear = 2023;
    const currentMonth = 11;

    // {
    //   type: Sequelize.QueryTypes.SELECT,
    // }

    const [result, metadata] = await sequelize.query(
      `
SELECT COUNT(id) AS studentCount
FROM Students
WHERE isFree = 'non'

AND id NOT IN (
  SELECT studentId
  FROM payments
  WHERE MONTH(paymentDate) = 11
  AND YEAR(paymentDate) = 2023
)
`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Retrieve payments for the current month and year

    res.status(200).json({
      result,
      unpaidStudentsCount: result.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.sumOfEachLevel = async (req, res) => {
  const excludedLevelIds = [19, 18, 17, 16, 15, 9, 7, 20, 21, 22];
  try {
    const sums = await Sequelize.query(
      `
      SELECT
        s.levelId,
        l.name,
        l.price,
        (
          SELECT COUNT(*)
          FROM students AS s2
          WHERE s2.levelId = s.levelId and isFree = 'non'
        ) AS totalStudentsCount,
        SUM(p.price - s.discount) AS totalSum
      FROM
        payments as p
      INNER JOIN
        students as s ON p.studentId = s.id
      INNER JOIN
        levels as l ON s.levelId = l.id
      WHERE
        s.levelId IN (19, 18, 17, 16, 15, 9, 7, 20, 21, 22)
        AND MONTH(p.paymentDate) = 11
      GROUP BY
        s.levelId, l.name;
    `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(sums);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.sumOfOxygenLevel = async (req, res) => {
  const excludedLevelIds = [19, 18, 17, 16, 15, 9, 7, 20, 21, 22];
  try {
    const sums = await Sequelize.query(
      `
      SELECT
        s.levelId,
        l.name,
        l.price,
        (
          SELECT COUNT(*)
          FROM students AS s2
          WHERE s2.levelId = s.levelId  and isFree = 'non'
        ) AS totalStudentsCount,
        SUM(p.price - s.discount) AS totalSum
      FROM
        payments as p
      INNER JOIN
        students as s ON p.studentId = s.id
      INNER JOIN
        levels as l ON s.levelId = l.id
      WHERE
        s.levelId NOT IN (19, 18, 17, 16, 15, 9, 7, 20, 21, 22)
        AND MONTH(p.paymentDate) = 11
      GROUP BY
        s.levelId, l.name;
    `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(sums);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.totalSupportOnly = async (req, res) => {
  const { month, year, range, inORnot } = req.body;
  const excludedLevelIds = range;
  const selectedMonth = month;
  const selectedYear = year;
  const selected = inORnot === "notIn" ? Op.notIn : Op.in;

  try {
    const sum = await Payment.findAll({
      where: {
        "$student.levelId$": { [selected]: excludedLevelIds },

        "$student.isFree$": "non",
        paymentDate: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn("MONTH", Sequelize.col("paymentDate")),
              selectedMonth
            ),
            Sequelize.where(
              Sequelize.fn("YEAR", Sequelize.col("paymentDate")),
              selectedYear
            ),
          ],
        },
      },
      include: [
        {
          model: Student,
          as: "student",
          include: [
            {
              model: Level,
            },
            {
              model: Absence,
            },
          ],
        },
      ],
    });
    const payload = {
      totalSum: function (sum) {
        if (inORnot === "in") {
          return { sum };
        }
      },
    };

    res.status(200).json({ totalSum: calculateTotalSum(sum) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
// Function to calculate the total sum of prices
const calculateTotalSum = (data) => {
  let sum = 0;
  for (const payment of data) {
    sum += payment.price;
  }
  return sum;
};
exports.paymentsEvolutionByRange = async (req, res) => {
  try {
    const { range } = req.query;

    switch (range) {
      case "years":
        const year = req.query.year || new Date().getFullYear();
        const yearPayments = await fetchPaymentsByYear(year);
        res.json(yearPayments);
        break;
      case "months":
        const yearMonth =
          req.query.yearMonth || new Date().toISOString().slice(0, 7);
        const monthPayments = await fetchPaymentsByMonth(yearMonth);
        res.json(monthPayments);
        break;
      case "days":
        const date = req.query.date || new Date().toISOString().slice(0, 10);
        const dayPayments = await fetchPaymentsByDay(date);
        res.json(dayPayments);
        break;
      default:
        res.status(400).json({ error: "Invalid range parameter" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function fetchPaymentsByYear(year) {
  return await Payment.findAll({
    attributes: ["createdAt", "price"], // Adjust attributes based on your data structure
    where: {
      createdAt: {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      },
    },
  });
}

async function fetchPaymentsByMonth(yearMonth) {
  return await Payment.findAll({
    attributes: ["createdAt", "price"], // Adjust attributes based on your data structure
    where: {
      createdAt: {
        [Op.between]: [`${yearMonth}-01`, `${yearMonth}-31`],
      },
    },
  });
}

async function fetchPaymentsByDay(date) {
  return await Payment.findAll({
    attributes: ["createdAt", "price"], // Adjust attributes based on your data structure
    where: {
      createdAt: {
        [Op.startsWith]: date,
      },
    },
  });
}

exports.getTotalPaymentsByMonthThisYear = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Fetch total payments for each month of the current year
    const paymentsByMonth = await Payment.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("payments.createdAt")), "month"],
        [Sequelize.fn("YEAR", Sequelize.col("payments.createdAt")), "year"],
        [Sequelize.fn("SUM", Sequelize.col("payments.price")), "totalPayment"],
      ],
      include: [
        {
          model: Student,
          required: true,
          attributes: [], // Include no attributes from the Student model
          where: {
            isFree: { [Op.ne]: "oui" }, // Exclude entries where isFree is 'oui'
            actif: { [Op.not]: 0 }, // Exclude entries where actif is 0
          },
        },
      ],
      where: Sequelize.where(
        Sequelize.fn("YEAR", Sequelize.col("payments.createdAt")),
        currentYear
      ),
      group: [
        Sequelize.fn("MONTH", Sequelize.col("payments.createdAt")),
        Sequelize.fn("YEAR", Sequelize.col("payments.createdAt")),
      ],
      raw: true,
    });

    res.json({ paymentsByMonth });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.params.userId; // Correctly set userId from req.user

    const { paymentDate, price, rest, studentId, oldData } = req.body;

    // Find the payment by ID
    const payment = await Payment.findOne({ where: { id: paymentId } });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update the payment details
    const updatedPayment = await payment.update({ paymentDate, price, rest });

    // Log the update action
    await logPaymentAction('UPDATE', paymentId, userId, {
      oldData,
      newData: { paymentDate, price, rest },
    });

    // Fetch student and level details
    const student = await getStudent(studentId);

    // Respond with the updated payment
    res.status(200).json({ success: true, payment: updatedPayment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating payment", error: error.message });
  }
};
