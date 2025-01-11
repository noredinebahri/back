const Student = require("../student/student.model");
const Payment = require("./payment.model");
const Level = require("../level/level.model");
const Absence = require("../absence/absence.model");
const { Op, literal, sequelize } = require("sequelize");
const Sequelize = require("../../params/db");
exports.payment = (req, res) => {
  const { paymentDate, studentId } = req.body;
  const fromMonth = new Date(paymentDate).getMonth() + 1;
  const fromYear = new Date(paymentDate).getFullYear();
  Sequelize.query(
    `SELECT * FROM payments where month(paymentDate) = ${fromMonth} and studentId = ${studentId} and year(paymentDate) = ${fromYear}`,
    {
      type: Sequelize.QueryTypes.SELECT,
    }
  )
    .then((found) => {
      if (found.length > 0) {
        res.status(301).json({
          success: false,
          reason: "exist",
          payload: found,
        });
      } else {
        Payment.create(req.body)
          .then((data) => {
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
exports.getUnpaidStudents = async () => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  try {
    const unpaidStudents = await Student.findAll({
      include: [{
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
      }],
      where: {
        actif: 1, // Assuming only active students are considered
      },
    });

    return unpaidStudents;
  } catch (error) {
    console.error("Error fetching unpaid students:", error);
    throw error;
  }
};

exports.quickPay = (req, res) => {
  const { year, month, day } = req.body.data;
  const id = req.body.userId;
  const price = req.body.price;

  Sequelize.query(
    `SELECT * FROM payments where month(paymentDate) = ${month} and studentId = ${id} and year(paymentDate) = ${year}`,
    {
      type: Sequelize.QueryTypes.SELECT,
    }
  )
    .then((found) => {
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
          studentId: id,
          price
        }
        Payment.create(payload)
          .then((data) => {
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
      include: [{
        model: Level,
      }, {
        model: Payment,
        required: false,
      }],
      where: {
        actif: true,
        [Sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn('month', Sequelize.col('payment.paymentDate')), month),
          Sequelize.where(Sequelize.fn('year', Sequelize.col('payment.paymentDate')), year),
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
    res.status(200).json(sum)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
exports.studentPaidMonth = async (req, res) => {
  try {
    const { month, year } = req.body;
    const studentsPaid = await Sequelize.query(
      `SELECT *
      FROM students AS s
      INNER JOIN levels AS l ON l.id = s.levelId
      LEFT JOIN payments AS p ON p.studentId = s.id
      WHERE s.actif = 1 AND MONTH(p.paymentDate) = ${month}
      AND YEAR(p.paymentDate) = ${year}`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    res.status(200).json(studentsPaid)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
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
    s.actif = 1  and isFree="non" 
    AND (MONTH(p.paymentDate) IS NULL OR p.paymentDate IS NULL)
`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(studentsNotPaid)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
exports.getStudentsNotPaidThisMonth = async (req, res) => {
  try {
    const { month, year, only } = req.body;
    // Get the last day of the given month
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const studentOnlyPaid = (only === 0) ?
      `AND (p.paymentDate IS NULL OR (p.paymentDate < '${year}-${month}-01' OR p.paymentDate > '${year}-${month}-${lastDayOfMonth}'))` :
      ``;
    const students = await Sequelize.query(
      `SELECT l.id as idlevel,s.firstname, s.lastname, p.price, l.name AS levelName, s.id, s.levelId, s.discount, s.rejected, p.paymentDate
      FROM students AS s
      INNER JOIN levels AS l ON l.id = s.levelId
      LEFT JOIN payments AS p ON p.studentId = s.id
      WHERE s.actif = 1  AND MONTH(p.paymentDate) = ${month} AND YEAR(p.paymentDate) = ${year}`,
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
      WHERE s.actif = 1`,
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
      where s.actif = 1 and month(p.paymentDate) = ${month} and year(p.paymentDate) = ${year} order by p.paymentDate desc`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    )
    result.map(x => {
      x.private_token = null;
      x.password = null;
    })
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};
exports.paymentDelete = (req, res) => {
  const { id } = req.params;
  Payment.destroy({ where: { id: id } })
    .then((pay) => {
      if (pay == 1) {
        res.status(202).json({ success: true });
      }
    })
    .catch((error) => {
      res.status(404).json({ success: false, raison: error });
    });
};
exports.getUnpaidStudents = async (req, res) => {
  let { startDay, endDay, month, year } = req.body;

  // If startDay or endDay is not a number, set them to the first and last day of the month
  if (typeof startDay !== 'number') {
    startDay = 1;
  }

  if (typeof endDay !== 'number') {
    const currentDate = new Date();
    endDay = new Date(year || currentDate.getFullYear(), month !== undefined ? month : currentDate.getMonth() + 1, 0).getDate();
  }

  const startDate = new Date(Date.UTC(year || new Date().getFullYear(), (month !== undefined ? month - 1 : new Date().getMonth()), startDay, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year || new Date().getFullYear(), (month !== undefined ? month - 1 : new Date().getMonth()), endDay, 23, 59, 59, 999));

  try {
    const unpaidStudents = await Student.findAll({
      include: [{
        model: Payment,
        where: {
          paymentDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        required: false,
      }],
      where: {
        actif: 1,
        '$payments.id$': { [Op.eq]: null }, // Check if there are no payments
      },
    });
    res.status(200).json({ total: unpaidStudents.lengtH, unpaidStudents });
  } catch (error) {
    console.error("Error fetching unpaid students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSumOfPaymentsForCurrentMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const sumOfPayments = await Payment.sum("price", {
      where: {
        paymentDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    res.status(200).json({ sumOfPayments });
  } catch (error) {
    console.error(error);
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
        [Sequelize.fn('YEAR', Sequelize.col('paymentDate')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('paymentDate')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'paymentCount'],
      ],
      group: ['year', 'month'],
    });

    res.status(200).json({ paymentEvolution });
  } catch (error) {
    console.error('Error fetching payment evolution:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
exports.unpaidStudents = async (req, res) => {
  try {
    const { year, month } = req.params;
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);

    if (isNaN(parsedYear) || isNaN(parsedMonth)) {
      return res.status(400).json({ error: 'Invalid year or month provided.' });
    }

    const currentYear = 2023;
    const currentMonth = 11;

    // {
    //   type: Sequelize.QueryTypes.SELECT,
    // }

    const [result, metadata] = await sequelize.query(`
SELECT COUNT(id) AS studentCount
FROM Students
WHERE isFree = 'non'
AND actif = 1
AND id NOT IN (
  SELECT studentId
  FROM payments
  WHERE MONTH(paymentDate) = 11
  AND YEAR(paymentDate) = 2023
)
`, {
      type: sequelize.QueryTypes.SELECT
    });

    // Retrieve payments for the current month and year

    res.status(200).json({
      result,
      unpaidStudentsCount: result.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.sumOfEachLevel = async (req, res) => {
  const excludedLevelIds = [19, 18, 17, 16, 15, 9, 7, 20, 21, 22];
  try {
    const sums = await Sequelize.query(`
      SELECT
        s.levelId,
        l.name,
        l.price,
        (
          SELECT COUNT(*)
          FROM students AS s2
          WHERE s2.levelId = s.levelId and s2.actif = 1 and isFree = 'non'
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
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(sums);
  } catch (error) {
    console.error('Error fetching sums for each level:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.sumOfOxygenLevel = async (req, res) => {
  const excludedLevelIds = [19, 18, 17, 16, 15, 9, 7, 20, 21, 22];
  try {
    const sums = await Sequelize.query(`
      SELECT
        s.levelId,
        l.name,
        l.price,
        (
          SELECT COUNT(*)
          FROM students AS s2
          WHERE s2.levelId = s.levelId and s2.actif = 1 and isFree = 'non'
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
    `, {
      type: Sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(sums);
  } catch (error) {
    console.error('Error fetching sums for each level:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.totalSupportOnly = async (req, res) => {
  const { month, year, range, inORnot } = req.body;
  const excludedLevelIds = range;
  const selectedMonth = month
  const selectedYear = year
  const selected = inORnot === 'notIn' ? Op.notIn : Op.in

  try {
    const sum = await Payment.findAll({
      where: {
        '$student.levelId$': { [selected]: excludedLevelIds },
        '$student.actif$': 1,
        '$student.isFree$': 'non',
        paymentDate: {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('paymentDate')), selectedMonth),
            Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('paymentDate')), selectedYear),
          ],
        },
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: Level
            },
            {
              model: Absence
            }
          ]
        },

      ],
    });
    const payload = {
      totalSum: function (sum) {
        if (inORnot === 'in') {
          return { sum }
        }
      }
    }

    res.status(200).json({ totalSum: calculateTotalSum(sum) });
  } catch (error) {
    console.error('Error fetching total sum:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      case 'years':
        const year = req.query.year || new Date().getFullYear();
        const yearPayments = await fetchPaymentsByYear(year);
        res.json(yearPayments);
        break;
      case 'months':
        const yearMonth = req.query.yearMonth || new Date().toISOString().slice(0, 7);
        const monthPayments = await fetchPaymentsByMonth(yearMonth);
        res.json(monthPayments);
        break;
      case 'days':
        const date = req.query.date || new Date().toISOString().slice(0, 10);
        const dayPayments = await fetchPaymentsByDay(date);
        res.json(dayPayments);
        break;
      default:
        res.status(400).json({ error: 'Invalid range parameter' });
    }
  } catch (error) {
    console.error('Error fetching payments data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function fetchPaymentsByYear(year) {
  return await Payment.findAll({
    attributes: ['createdAt', 'price'], // Adjust attributes based on your data structure
    where: {
      createdAt: {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      },
    },
  });
}

async function fetchPaymentsByMonth(yearMonth) {
  return await Payment.findAll({
    attributes: ['createdAt', 'price'], // Adjust attributes based on your data structure
    where: {
      createdAt: {
        [Op.between]: [`${yearMonth}-01`, `${yearMonth}-31`],
      },
    },
  });
}

async function fetchPaymentsByDay(date) {
  return await Payment.findAll({
    attributes: ['createdAt', 'price'], // Adjust attributes based on your data structure
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
        [Sequelize.fn('MONTH', Sequelize.col('payments.createdAt')), 'month'],
        [Sequelize.fn('YEAR', Sequelize.col('payments.createdAt')), 'year'],
        [Sequelize.fn('SUM', Sequelize.col('payments.price')), 'totalPayment'],
      ],
      include: [
        {
          model: Student,
          required: true,
          attributes: [], // Include no attributes from the Student model
          where: {
            isFree: { [Op.ne]: 'oui' }, // Exclude entries where isFree is 'oui'
            actif: { [Op.not]: 0 } // Exclude entries where actif is 0
          }
        }
      ],
      where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('payments.createdAt')), currentYear),
      group: [
        Sequelize.fn('MONTH', Sequelize.col('payments.createdAt')),
        Sequelize.fn('YEAR', Sequelize.col('payments.createdAt'))
      ],
      raw: true,
    });

    res.json({ paymentsByMonth });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

