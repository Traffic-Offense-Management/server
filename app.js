const express = require('express');
const app = express();

const cors = require('cors');
const mysql = require('mysql');

app.use(cors())
app.use(
    express.urlencoded({
      extended: true
    })
  )

app.use(express.json())

const conn = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "admin",
    database : "project"
});

conn.connect(function(err){
    if(err)
        throw err;
})   

console.log("Started server...")

app.listen(8080, () => {})

app.get("/offenses", async(req, res) => {

    conn.query('select * from offense', function(err, result){
        if(err)
            throw err;
        res.json(result);
    })  
    
})

app.get("/user/:userId", async(req, res) => {

    let query = 'select * from user where user_id = ?';
    let queryString = mysql.format(query, [req.params.userId]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
    })      
})

app.post("/police/auth", async(req, res) => {
    
    let query = 'select * from police where username = ? and password = ?';
    let body = req.body;
    let formattedQuery = mysql.format(query, [body.username, body.password]);
    conn.query(formattedQuery, function(err, result){
        if(err || result.length == 0){
            console.log(err);
            res.status(401);
            res.send({message : 'Invalid username or password'});
        }
        else{
            res.send({
                message : 'Login successful',
                policeId : result[0].police_id
            });
        }
    })
})

app.get("/police", async(req, res) => {

    conn.query('select * from police', function(err, result){
        if(err)
            throw err;
        res.json(result);
    })   
    
});

app.get("/policestations", async(req, res) => {

    conn.query('select * from police_station', function(err, result){
        if(err)
            throw err;
        res.json(result);
    })   
    
});

app.get("/offenses", async(req, res) => {

    conn.query('select * from offense', function(err, result){
        if(err)
            throw err;
        console.log('offenses');
        console.log(res);
        res.json(result);
    })   
    
})

// police api calls 

app.get("/police/:policeId", async(req, res) => {

    let query = 'select * from police inner join police_station on police.station_id = police_station.station_id where police_id = ?';
    let queryString = mysql.format(query, [req.params.policeId]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        console.log("Fetching details of police with id", req.params.policeId);
        console.log(result);
        res.json(result);
    })      
})

app.get("/police/offenses/:policeId", async(req, res) => {

    let query = 'select * from offender natural join offense where police_id = ? order by fine_no desc';
    let queryString = mysql.format(query, [req.params.policeId]);
    conn.query(queryString, function(err, result){
        if(err){
            console.log(err);
            res.err({message: "Error fetching offense history recorded by police "+ req.params.policeId});

        }
        else{
            console.log(result[0]);
        }
        res.json(result);
    })      
})

app.post("/police/offenses/new", async(req, res) => {
 
    let query = 'insert into offender(name, dl_no, vehicle_no, police_id, place, time, offense_no) values(?, ?, ?, ?, ?, ?, ?);'
    let body = req.body;
    console.log(req.body);
    let formattedQuery = mysql.format(query, [body.name, body.dl_no, body.vehicle_no, body.police_id, body.place, body.time, body.offense_no]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.status(400);
            res.send({status : 'Error : Please check the input'})
            console.log(err)
        }
        else{
            res.send({status : "Successful registration"})
        }
    })
})

app.post("/police/towing/new", async(req, res) => {
 
    let query = 'insert into towed_vehicles(vehicle_no, station_id, place, offense_no, time) values(?, ?, ?, 6, ?);'
    let body = req.body;
    console.log(req.body);
    let formattedQuery = mysql.format(query, [body.vehicle_no, body.station_id, body.place, body.time]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.status(400);
            res.send({status : 'Error : Please check the input'})
            console.log(err)
        }
        else{
            res.send({status : "Successful registration"})
        }
    })
})

app.get("/complaints/:userId", async(req, res) => {

    let query = 'select * from complaints where user_id = ?';
    let queryString = mysql.format(query, [req.params.userId]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
    })     
})

app.post("/complaints/new", async(req, res) => {

    let query = 'insert into complaints(user_id, police_id, station_id, description, date) values(?, ?, ?, ?, ?);'
    let body = req.body;
    let formattedQuery = mysql.format(query, [body.userId, body.policeId, body.stationId, body.description, body.date]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.send({status : 'Error : Please check the input'})
            console.log(err)
        }
        res.send({status : "Successful registration"})
    })
})

app.get("/offenses/:dlNo", async(req, res) => {

    let query = 'select * from offender where dl_no = ?';
    let queryString = mysql.format(query, [req.params.dlNo]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
    })      
})

