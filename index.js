const {
  fetch_and_store_facebook_messages,
  delete_previous_threads,
} = require("./services");

exports.handler = async (event) => {
  try {
    if (event.Records[0].eventName === "INSERT") {
      await delete_previous_threads(event);
    }

    if (
      event.Records[0].dynamodb?.NewImage?.threadType?.S == "Facebook_Thread"
    ) {
      await fetch_and_store_facebook_messages(thread);
    }

    return { status: 1 };
  } catch (err) {
    console.log(err);
  }
};
