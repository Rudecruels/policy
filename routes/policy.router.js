const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Worker } = require("worker_threads");
const upload = multer({ dest: "uploads/" });
const path = require("path");
const UserDetails = require("../models/userDetails");
const Policy = require("../models/policy");
const Lob = require("../models/lob");
const PolicyCarrier = require("../models/policyCarrier");
const cron = require("node-cron");
const Message = require("../models/messages");
const os = require("os-utils");
const { exec } = require("child_process");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log("🚀 ~ router.post ~ filePath:", filePath);
    const worker = new Worker("./worker.js", {
      workerData: { filePath },
    });

    worker.on("message", (msg) => {
      if (msg.success) {
        res.status(200).json({ message: "Data uploaded successfully" });
      } else {
        res.status(500).json({ error: msg.error });
      }
    });

    worker.on("error", (err) => {
      res.status(500).json({ error: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/policy-by-username", async (req, res) => {
  const { username } = req.query;

  const user = await UserDetails.findOne({ firstName: username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const policies = await Policy.find({ userId: user._id })
    .populate("policyCategoryId")
    .populate("companyId")
    .populate("userId");
  res.json({ policies });
});

router.get("/aggregate-policy", async (req, res) => {
  try {
    const aggregatedPolicies = await Policy.aggregate([
      {
        $group: {
          _id: "$userId",
          totalPolicies: { $sum: 1 },
          policies: {
            $push: {
              policyNumber: "$policyNumber",
              policyStartDate: "$policyStartDate",
              policyEndDate: "$policyEndDate",
            },
          },
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userName: "$user.firstName",
          totalPolicies: 1,
          policies: 1,
        },
      },
    ]);
    res.status(200).json(aggregatedPolicies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/schedule-message", async (req, res) => {
  try {
    const { message, day, time } = req.body;
    const scheduledTime = new Date(`${day} ${time}`);

    if (isNaN(scheduledTime)) {
      return res.status(400).json({ error: "Invalid date or time" });
    }

    const cronTime = `${scheduledTime.getSeconds()} ${scheduledTime.getMinutes()} ${scheduledTime.getHours()} ${scheduledTime.getDate()} ${
      scheduledTime.getMonth() + 1
    } *`;

    cron.schedule(cronTime, async () => {
      const messageDoc = new Message({
        message,
        scheduledTime,
        status: "completed",
      });
      await messageDoc.save();
      console.log(`Message "${message}" inserted into DB at ${scheduledTime}`);
    });

    res
      .status(200)
      .json({ message: "Message will be inserted at scheduled time" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function monitorCPU() {
  setInterval(() => {
    os.cpuUsage((v) => {
      console.log("CPU Usage: " + v * 100 + "%");
      if (v > 0.7) {
        console.log("Restarting server due to high CPU");
        exec("pm2 restart app");
      }
    });
  }, 5000);
}

monitorCPU();

module.exports = router;
