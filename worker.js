const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const fs = require("fs");
const Agent = require("./models/agent");
const Policy = require("./models/policy");
const PolicyCarrier = require("./models/policyCarrier");
const Lob = require("./models/lob");
const UserAccount = require("./models/userAccount");
const UserDetails = require("./models/userDetails");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connection  in worker thread successful!");

    const workbook = XLSX.readFile(workerData.filePath);
    const sheetNames = workbook.SheetNames;

    const worksheet = workbook.Sheets[sheetNames[0]];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const [agents, users, accounts, lobs, carriers] = await Promise.all([
      Agent.find().select("agentName"),
      UserDetails.find().select("firstName _id"),
      UserAccount.find().select("accountName userId"),
      Lob.find().select("categoryName _id"),
      PolicyCarrier.find().select("companyName _id"),
    ]);

    const agentMap = new Map(agents.map((a) => [a.agentName, a._id]));
    const userMap = new Map(users.map((u) => [u.firstName, u._id]));
    const accountMap = new Map(accounts.map((a) => [a.accountName, a.userId]));
    const lobMap = new Map(lobs.map((l) => [l.categoryName, l._id]));
    const carrierMap = new Map(carriers.map((c) => [c.companyName, c._id]));

    function excelDateToJSDate(serial) {
      const utc_days = Math.floor(serial - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info;
    }

    for (const row of jsonData) {
      if (!agentMap.has(row["agent"])) {
        const newAgent = await Agent.create({ agentName: row["agent"] });
        agentMap.set(row["agent"], newAgent._id);
      }

      if (!userMap.has(row["producer"])) {
        const newUser = await UserDetails.create({
          firstName: row["producer"],
          gender: row["gender"],
          dob: excelDateToJSDate(row["dob"]),
          address: row["address"],
          phoneNumber: row["phone"],
          state: row["state"],
          zipCode: row["zip"],
          email: row["email"],
          userType: row["userType"],
        });
        userMap.set(row["producer"], newUser._id);
      }

      if (!accountMap.has(row["account_name"])) {
        const userId = userMap.get(row["first_name"]);
        const newAccount = await UserAccount.create({
          accountName: row["account_name"],
          userId,
        });
        accountMap.set(row["account_name"], newAccount.userId);
      }

      if (!lobMap.has(row["category_name"])) {
        const newCategory = await Lob.create({
          categoryName: row["category_name"],
        });
        lobMap.set(row["category_name"], newCategory._id);
      }

      if (!carrierMap.has(row["company_name"])) {
        const newCarrier = await PolicyCarrier.create({
          companyName: row["company_name"],
        });
        carrierMap.set(row["company_name"], newCarrier._id);
      }

      await Policy.create({
        policyNumber: row["policy_number"],
        policyStartDate: excelDateToJSDate(row["policy_start_date"]),
        policyEndDate: excelDateToJSDate(row["policy_end_date"]),
        policyCategoryId: lobMap.get(row["category_name"]),
        companyId: carrierMap.get(row["company_name"]),
        userId: userMap.get(row["first_name"]),
      });
    }

    fs.unlinkSync(workerData.filePath);

    parentPort.postMessage({ success: true });
  } catch (err) {
    console.log("🚀 ~ err:", err);
    parentPort.postMessage({ success: false, error: err.message });
  } finally {
    await mongoose.connection.close();
  }
})();
