const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended: false}))

var connection = require('../db')

const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(
    accountSid, authToken
);

var destContact, messageBody = ""

var phoneNumber, deviceName, envId

router.get('/recording/:phone_no/:device_name/:env_id', (req, res) => {
    console.log(`GET request: Fetching user with phone number ${req.params.phone_no}`);
    
    phoneNumber = req.params.phone_no;
    deviceName = req.params.device_name;
    envId = req.params.env_id;

    const queryString = "SELECT session_id FROM recording WHERE phone_no = ? && device_name = ? && env_id = ?";

    var query = connection.query(queryString, [phoneNumber, deviceName, envId], function(error, results){
        if(error)
            console.log(`Error connecting ${error}`);
        else
            // res.json(results)
            console.log(`Fetched the session id ${results[0].session_id}`);
            res.send(results[0].session_id);
    });

    console.log(query.sql);
})

router.post('/recording/create', (req, res) => {
    console.log("Trying to create a new user..");

    phoneNumber = req.body.create_phone_number;
    deviceName = req.body.create_device_name;
    envId = req.body.create_env_id;

    const insertQueryString = "INSERT INTO recording (phone_no, device_name, \
                               env_id, session_id) VALUES(?, ?, ?, uuid())";
    const selectQueryString = "SELECT session_id FROM recording WHERE \
                               phone_no = ? && device_name = ? && env_id = ?";

    query = connection.query(selectQueryString, [phoneNumber, deviceName, envId], function(error, results){
        if(error){
            console.log(`Failed to select from the database: ${error}`);
            res.sendStatus(500);
        }
        if(results.length){
            console.log("Found the registered session id " + results[0].session_id);
            res.send("You're already registered with session id " + results[0].session_id);

            console.log("You are in " + process.env.EXECUTION_MODE + " mode");

            if(process.env.EXECUTION_MODE == "test"){
                destContact = process.env.MY_PHONE_NUMBER;
                messageBody = "SMS from node.js test project! Here are the details: \
                               Phone no.: " + phoneNumber + ". Device name: " + deviceName + 
                               ". Env id: " + envId + ". Session id: " + results[0].session_id;
            }else{
                destContact = phoneNumber;
                messageBody = "SMS from node.js production project! Your session id is " + results[0].session_id;
            }
        }else{
            connection.query(insertQueryString, [phoneNumber, deviceName, envId], 
                             function(insertError, insertResults){
                if(insertError) throw insertError;
            });
            connection.query(selectQueryString, [phoneNumber, deviceName, envId], 
                             function(selectError, selectResults){
                if(selectError){
                    console.log(`Failed to select uuid: ${selectError}`);
                    res.sendStatus(500);
                }

                console.log("POST request: Registered a new session id: " + selectResults[0].session_id);
                res.send("Thank you for registering! Your new session ID is: " + selectResults[0].session_id);

                console.log("You are in " + process.env.EXECUTION_MODE + " mode");

                if(process.env.EXECUTION_MODE == "test"){
                    destContact = process.env.MY_PHONE_NUMBER;
                    messageBody = "SMS from node.js test project! Here are the details: \
                                   Phone no.: " + phoneNumber + ". Device name: " + deviceName + 
                                   ". Env id: " + envId + ". Session id: " + results[0].session_id;
                }else{
                    destContact = phoneNumber;
                    messageBody = "SMS from node.js production project! Your session id is " 
                                    + selectResults[0].session_id;
                }
            });
        }
        client.messages.create({
            from: +16507501744,
            to: destContact,
            body: messageBody
        }, function(err, message){
            if(err){
                console.log(err.message);
            }
        });
        // res.end();  
    });
})

router.get('/error', (req, res) => {
    throw new Error('This is a forced error.')
})

module.exports = router