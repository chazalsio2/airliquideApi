import axios from "axios";

export function sendMessageToSlack({ message, copyToCommercial = false }) {
  const text = `[${process.env.NODE_ENV}] ${message}`;
  if (process.env.NODE_ENV === "development") {
    console.info("[SLACK]", text);
  } else {
    axios.post(process.env.SLACK_ADMIN_WEBHOOK, {
      text,
    });

    if (copyToCommercial) {
      axios.post(process.env.SLACK_COMMERCIAL_WEBHOOK, {
        text,
      });
    }
  }
}
