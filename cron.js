import cron from "node-cron";
import Project from "./models/Project";
import moment from "moment";
import { sendClientReminder } from "./lib/email";

cron.schedule("0 0 * * * *", () => {
  // Project createdAt between 1 and 2 hours ago
  const projects = Project.find({
    status: "missing_information",
    createdAt: {
      $gte: moment().subtract(2, "hours"),
      $lt: moment().subtract(1, "hours"),
    },
  }).lean();

  projects.forEach((project) => {
    sendClientReminder(project);
  });
});
