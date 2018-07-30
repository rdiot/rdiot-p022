'use strict';
console.log('RDIoT S3toDynamoDB Loading post function');
var AWS = require('aws-sdk'); 
var s3 = new AWS.S3();
var dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    var bucket = event.Records[0]['s3']['bucket']['name'];
    var en = event.Records[0]['eventName'];
    var et = event.Records[0]['eventTime'];
    var key = event.Records[0]['s3']['object']['key'];
    var sip = event.Records[0]['requestParameters']['sourceIPAddress'];

    var params1 = {Bucket: bucket, Key: key}; 

    s3.getObject( params1, function(err,data) {
        if(err) {
            console.log(err.stack);
            callback(err);
        } else {
            var value = data.Body.toString('ascii')
            console.log(data);
            console.log("Raw text:\n" + value);

            var params2 = {
                TableName: "pi-sensor",
                Item:{
                    "id": et,
                    "event" : en,
                    "bucket": bucket,
                    "key" : key,
                    "sip": sip,
                    "value" : value
                }
            };
            console.log("Gettings IoT device details...");

            //S3 to DynamoDB
            dynamo.put(params2, function(err, data) {
                if(err) {
                    console.error("Unable to post devices. Error JSON:", JSON.stringify(err, null, 2));
                    context.fail();
                } else {
                    console.log("keepet data:", JSON.stringify(data, null, 2));
                    context.succeed('success post');
                }

            });
        }
    });
}
