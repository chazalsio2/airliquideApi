import cron from "node-cron";
import Project from "./models/Project";
import moment from "moment";
import { sendClientReminder } from "./lib/email";

cron.schedule("0 0 * * * *", async () => {
  // Project createdAt between 2 and 3 hours ago
  const projects = await Project.find({
    status: "missing_information",
    createdAt: {
      $gte: moment().subtract(3, "hours"),
      $lt: moment().subtract(2, "hours"),
    },
  }).lean();

  projects.forEach((project) => {
    sendClientReminder(project);
  });
});
