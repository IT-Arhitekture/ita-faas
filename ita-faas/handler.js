'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1'
});

const TABLE_NAME = process.env.EVENTS_TABLE;

module.exports.createEntry = async (event) => {
  const { title, description, date } = JSON.parse(event.body);
  const id = uuid.v4();
  const newEntry = { id, title, description, date };
  await docClient.put({
    TableName: TABLE_NAME,
    Item: newEntry
  }).promise();
  return {
    statusCode: 201,
    body: JSON.stringify(newEntry)
  };
};


module.exports.getEntries = async () => {
  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items)
  };
};


module.exports.getEntry = async (event) => {
  const { id } = event.pathParameters;
  const data = await docClient.get({
    TableName: TABLE_NAME,
    Key: { id }
  }).promise();
  if (!data.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Entry not found' })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(data.Item)
  };
};


module.exports.deleteEntry = async (event) => {
  const { id } = event.pathParameters;
  await docClient.delete({
    TableName: TABLE_NAME,
    Key: { id }
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Entry deleted successfully' })
  };
};