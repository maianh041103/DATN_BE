const config = require("config");
const axios = require("axios");
const _ = require("lodash");
const { HttpStatusCode } = require("../../helpers/errorCodes");

async function sendUpdate(chatId, text) {
  try {
    const token = _.get(config, "telegram.alert.token", "");
    if (!chatId) {
      chatId = _.get(config, "telegram.alert.chat_id", "");
    }
    const url = "https://api.telegram.org/bot" + token + "/sendMessage";
    const res = await axios({
      async: true,
      crossDomain: true,
      method: "post",
      url: url,
      headers: {
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
      data: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });
    return {
      success: true,
      data: res,
    };
  } catch (e) {
    const { errors = [] } = e;
    const [error = {}] = errors;
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, "message", "")}`,
    };
  }
}

export async function sendNotificationThroughTelegram(params) {
  const { chatId, text } = params;
  const result = await sendUpdate(chatId, text);
  if (result && result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  return {
    error: true,
    message: "Something went wrong while sending message to telegram channel",
  };
}
