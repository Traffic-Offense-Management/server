const express = require('express');
const app = express();

const cors = require('cors');
const mysql = require('mysql');

app.use(cors())

const conn = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "1234",
    database : "project"
});

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json())
    
conn.connect(function(err){
    if(err)
        throw err;
})   

console.log("Successful")

app.listen(8080, () => {})

app.get("/offenses", async(req, res) => {

    conn.query('select * from offense', function(err, result){
        if(err)
            throw err;
        res.json(result);
    })  
    
})

app.get("/police", async(req, res) => {

    conn.connect(function(err){
        if(err)
            throw err;
        conn.query('select * from police', function(err, result){
            if(err)
                throw err;
            res.json(result);
        })
    })    
    
})


// app.get("/police/:policeId", async(req, res) => {

//     let query = 'select * from police where police_id = ?';
//     let queryString = mysql.format(query, [req.params.policeId]);
//     conn.connect(function(err){
//         if(err)
//             throw err;
//         conn.query(queryString, function(err, result){
//             if(err)
//                 throw err;
//             res.json(result);
//         })
//     })       
// })


app.get("/user/:userId", async(req, res) => {

    let query = 'select * from user where user_id = ?';
    let queryString = mysql.format(query, [req.params.userId]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
    })      
})

app.get("/offenses/police/:policeId", async(req, res) => {

    let query = 'select * from offender where police_id = ?';
    let queryString = mysql.format(query, [req.params.policeId]);
    conn.connect(function(err){
        if(err)
            throw err;
        conn.query(queryString, function(err, result){
            if(err)
                throw err;
            res.json(result);
        })
    })       
})

app.get("/offenses/user/:username", async(req, res) => {

    let query = 'select police_id,offender.offense_no,offense.fine,fine_no,place,offense.description,time from offender inner join user inner join offense on offender.vehicle_no=user.vehicle_no and offense.offense_no=offender.offense_no where user_id= ? order by time desc';
    let queryString = mysql.format(query, [req.params.username]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
    })      
})

app.get("/offenses/tow/:username", async(req, res) => {

    let query = 'select user.vehicle_no,station_id,offense_no,fine_no,station_name,place,time from user natural join towed_vehicles natural join police_station where user_id= ? order by time desc';
    let queryString = mysql.format(query, [req.params.username]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
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

app.get("/offenses/:dlNo", async(req, res) => {

    let query = 'select * from offender where dl_no = ?';
    let queryString = mysql.format(query, [req.params.dlNo]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
    })      
})

app.post("/user/new",async(req, res)=>{
    let query = 'insert into user(user_id,name,dl_no,vehicle_no,address,phone,password) values(?,?,?,?,?,?,?)';
    let body=req.body;
    console.log(body);  
    let formatt=mysql.format(query,[body.userid,body.name,body.dlno,body.vehicle_no,body.addr,body.phone,body.password])
    console.log(formatt);
    conn.query(formatt,function(error,result){
        if(error){
              console.log("error");
              res.err({message:'inavlid user name'})
        }
        res.send({status:"Successful"})

    })
})

app.post("/complaints/new", async(req, res) => {

    let query = 'insert into complaints(user_id, police_id, station_id, description, status, date) values(?, ?, ?, ?, ?, ?);'
    let body = req.body;
    let formattedQuery = mysql.format(query, [body.userId, body.policeId, body.stationId, body.description, body.status, body.date]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.send({status : 'Error : Please check the input'})
            console.log(err)
        }
        res.send({status : "Successful registration"})
    })
})

app.get("/tow/:vehicle_no", async(req, res) => {

    let query = 'select * from towed_vehicles where vehicle_no = ?';
    console.log('here')
    let queryString = mysql.format(query, [req.params.vehicle_no]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
        console.log(result)
    })     
})

app.post("/publichome/complaints", async(req, res) => {

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

app.post("/publichome/malfunction", async(req, res) => {

    let query = 'insert into malfunction(userid, pincode, problem, descript, date) values(?, ?, ?, ? , ?);'
    let body = req.body;
    let formattedQuery = mysql.format(query, [body.userId, body.pincode, body.problem, body.descript, body.date]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.send({status : 'Error : Please check the input'})
            console.log(err)
        }
        res.send({status : "Successful registration"})
    })
})

app.get("/publichome/tow/:vehicle_no", async(req, res) => {

    let query = 'select * from towed_vehicles where vehicle_no = ?';
    console.log('here')
    let queryString = mysql.format(query, [req.params.vehicle_no]);
    conn.query(queryString, function(err, result){
        if(err)
            throw err;
        res.json(result);
        console.log(result)
    })     
})






