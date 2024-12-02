import _ from "lodash";
import { getCurrentTime } from "../../helpers/utils";
import { sendNotificationThroughTelegram } from "../../mpModules/notification/telegramIntegrationService";

const config = require("config");
const fs = require("graceful-fs");

export class CentralizedLogger {
  log(params) {
    let { level, data, message } = params;
    let logFile = fs.createWriteStream(this.setPath(), { flags: "a" });
    let content = this.setContent(level, data, message);
    if (level === "error") {
      sendNotificationThroughTelegram({
        chatId: _.get(config, "telegram.tracking.chat_id"),
        text: content,
      });
    }
    logFile.write(content);
    logFile.end();
  }

  setPath() {
    return `${config.get("log_path")}/${getCurrentTime("Ymd")}.log`;
  }

  setContent(level, data, message) {
    let content = getCurrentTime("H:i:s");
    content +=
      " [" + level + "] " + "[message] " + message + " [data] " + JSON.stringify(data) + "\n";
    return content;
  }
}
