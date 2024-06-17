require("dotenv").config();
const axios = require("axios");
const moment = require("moment");
const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_DYNAMIC_REGION });
const dynamodb = new AWS.DynamoDB.DocumentClient();
const DYNAMODB_TABLENAME = process.env.DYNAMODB_TABLENAME;

const get_messages_from_facebook = async (
  thread_identifier,
  page_access_token
) => {
  const url = `https://graph.facebook.com/v14.0/${thread_identifier}/messages`;
  const params = {
    access_token: page_access_token,
    fields: "id,message,from,to,created_time",
  };

  try {
    return await axios.get(url, { params });
  } catch (error) {
    console.error("Failed to fetch messages from Facebook:", error);
    throw error;
  }
};

exports.delete_old_threads = async (event) => {
  const old_thread = event.Records[0].dynamodb.NewImage;

  const deleteP = {
    Key: {
      thread_identifier: old_thread.thread_identifier.S,
      store_id: parseInt(old_thread.store_id.N, 10),
    },
    TableName: DYNAMODB_TABLENAME,
  };

  try {
    await dynamodb.delete(deleteP).promise();
    console.log(
      `Successfully deleted thread: ${old_thread.thread_identifier.S}`
    );
  } catch (error) {
    console.error(
      `Failed to delete thread: ${old_thread.thread_identifier.S}`,
      error
    );
    throw error;
  }
};

exports.fetch_and_store_facebook_messages = async (thread) => {
  const page_access_token = process.env.PAGE_ACCESS_TOKEN;

  let all_messages_data = [];
  try {
    let msg_response = await get_messages_from_facebook(
      thread.thread_identifier.S,
      page_access_token
    );
    let msg_data = msg_response.data;

    all_messages_data.push(...msg_data.data);

    while (msg_data && msg_data.paging && msg_data.paging.next) {
      try {
        msg_response = await axios.get(msg_data.paging.next);
        all_messages_data.push(...msg_response.data.data);
        msg_data = msg_response.data;
      } catch (error) {
        console.error(
          "API request failed during pagination: ",
          error.response.data
        );
        break;
      }
    }
  } catch (error) {
    console.error("Failed to fetch and store messages: ", error);
    throw error;
  }

  const msgs = all_messages_data
    .map((msg) => ({
      thread_identifier: msg.id,
      mid: msg.id,
      text: msg.message,
      attachments: msg.attachments,
      created_time: moment.utc(msg.created_time).format(),
      sorting_time: Date.parse(moment.utc(msg.created_time).format()),
    }))
    .reverse();

  const putParams = {
    TableName: DYNAMODB_TABLENAME,
    Item: {
      thread_identifier: thread.thread_identifier.S,
      messages: JSON.stringify(msgs),
    },
  };

  console.log("putParams", putParams);

  try {
    await dynamodb.put(putParams).promise();
    console.log(
      `Successfully stored messages for thread: ${thread.thread_identifier.S}`
    );
  } catch (error) {
    console.error(
      `Failed to store messages for thread: ${thread.thread_identifier.S}`,
      error
    );
    throw error;
  }
};
