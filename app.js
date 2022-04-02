const express = require('express');
const app = express();

const cors = require('cors');
const mysql = require('mysql');

app.use(cors())

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


app.get("/police/:policeId", async(req, res) => {

    let query = 'select * from police where police_id = ?';
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


