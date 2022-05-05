const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

require('dotenv').config();

const MY_EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         body: 'This is a sample text message',
//         from: '+19592511385',
//         to: '+919535664371'
//     })
//     .then(message => console.log(message.sid));


const cors = require('cors');
const mysql = require('mysql');

const pdf = require("pdf-creator-node");
const fs = require("fs");

const html = fs.readFileSync("challan.html", "utf8");

app.use(cors())
app.use(
    express.urlencoded({
      extended: true
    })
  )

app.use(express.json());

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: MY_EMAIL,
        pass: PASSWORD
    }
});

console.log('Set up nodemailer with username ' + MY_EMAIL);

const conn = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "admin",
    database : "project",
});


conn.connect(function(err){
    if(err)
        console.log(err);
})   ;

console.log('Connected to mysql database');

let pdfOptions = { 
    "format": "A3",
    "orientation" : "portrait",
    "header" : {
        "contents" : "<img src='./logo.jpg' />",
            "height": "20mm"
      },
    "footer" : {
    },

    "border": "10mm" };

console.log("Started server...")

app.listen(8080, () => {})

app.get("/offenses", async(req, res) => {

    conn.query('select * from offense where not exists (select offense_no from towing_offenses where towing_offenses.offense_no = offense.offense_no);', function(err, result){
        if(err)
            console.log(err);
        res.json(result);
    })  
    
})

app.get("/towing_offenses", async(req, res) => {

    conn.query('select * from towing_offenses natural join offense', function(err, result){
        if(err)
            console.log(err);
        res.json(result);
    })  
    
})

app.get("/user/:userId", async(req, res) => {

    let query = 'select * from user where user_id = ?';
    let queryString = mysql.format(query, [req.params.userId]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        res.json(result);
    })      
})

app.post("/police/auth", async(req, res) => {
    
    let query = 'select * from police where username = ? and password = ?';
    let body = req.body;
    let username = body.username;
    let formattedQuery = mysql.format(query, [body.username, body.password]);
    conn.query(formattedQuery, function(err, result){
        if(err || result.length == 0){
            console.log(err);
            res.status(401);
            res.send({message : 'Invalid username or password'});
        }
        else{
            // })
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
            console.log(err);
        res.json(result);
    })   
    
});

app.get("/policestations", async(req, res) => {

    conn.query('select * from police_station', function(err, result){
        if(err)
            console.log(err);
        res.json(result);
    })   
    
});

// police api calls 

app.get("/police/:policeId/dashboard", async(req, res) => {

    let query = 'select name from police where police_id = ?';
    let queryString = mysql.format(query, [req.params.policeId]);
    let policeName;
    let finalResult = {};
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        console.log(result);
        finalResult.name = result[0].name;
    })
    query = "select sum(fine) as total_fine, count(*) as num_offenses from offenses_today where police_id = ?";
    queryString = mysql.format(query, [req.params.policeId]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        console.log("Fetching dashboard of police with id", req.params.policeId);
        finalResult.total_fine_today = result[0].total_fine;
        finalResult.num_offenses_today = result[0].num_offenses;
        result[0].name = policeName;
        console.log(result);
    })
    query = "select sum(fine) as total_fine, count(*) as num_offenses from offenses_this_month where police_id = ?";
    queryString = mysql.format(query, [req.params.policeId]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        console.log("Fetching dashboard of police with id", req.params.policeId);
        finalResult.total_fine_month = result[0].total_fine;
        finalResult.num_offenses_month = result[0].num_offenses;
        console.log(result);
        res.json(finalResult);
    })
});

app.get("/police/:policeId", async(req, res) => {

    let query = 'select * from police inner join police_station on police.station_id = police_station.station_id where police_id = ?';
    let queryString = mysql.format(query, [req.params.policeId]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        console.log("Fetching details of police with id", req.params.policeId);
        console.log(result);
        res.json(result);
    })      
});

app.get("/police/challan/:fine_no", async(req, res) => {
    let query = 'select * from offender natural join offense  where fine_no = ?';
    let queryString = mysql.format(query, [req.params.fine_no]);
    conn.query(queryString, function(err, result){
        if(err){
            console.log(err);
            res.status(400);
            res.send({message: "Error fetching offense history recorded by police "+ req.params.policeId});
        }
        else{
            let offense = result[0];
            let offenseData = [{
                name : offense.name,
                description : offense.description,
                fine_no : offense.fine_no,
                police_id : offense.police_id,
                amount : offense.fine,
                place : offense.place,
                date : offense.date,
                time : offense.time,
                vehicle_no : offense.vehicle_no
            }]
            console.log(offenseData);
            let curDate = new Date();
            let pdfFile = "challan" + curDate.getTime() + ".pdf"
            var document = {
                html: html,
                data: {
                    offenseData: offenseData
                },
                path: pdfFile
            };

            pdfOptions['footer']['height'] = '20mm';
            pdfOptions['footer']['contents'] = '<div>This challan was generated on ' + curDate +  '</div>'

            pdf.create(document, pdfOptions)
            .then(response => {
                res.download(__dirname + "/" + pdfFile);
            })
            .catch(error => {
                console.error(error);
            });
            // res.sendFile(__dirname + '/challan.pdf');
        }
    });
})

app.get("/police/offenses/:police_id", async(req, res) => {

    let nameFilter = req.query.name_filter;
    let placeFilter = req.query.place_filter;
    let vehicleNoFilter = req.query.vehicle_no_filter;
    let sortByCriteria = req.query.sort_by;
    console.log(nameFilter, placeFilter, vehicleNoFilter)
    let query = 'select * from offender natural join offense where police_id = ? ';  

    query = mysql.format(query, [req.params.police_id]);
    if(nameFilter){
        nameFilter += '%';
        query += " and name like ? ";
        query = mysql.format(query, nameFilter);
    }
    if(placeFilter){
        placeFilter += '%';
        query += " and place like ? ";
        query = mysql.format(query, placeFilter);
    }
    if(vehicleNoFilter){
        vehicleNoFilter += '%';
        query += " and vehicle_no like ? ";
        query = mysql.format(query, vehicleNoFilter);
    }
    if(sortByCriteria === 'name'){
        query += ' order by name ';
    }
    else{
        query += ' order by time desc';
    }
    console.log(query);
    conn.query(query, function(err, result){
        if(err){
            console.log(err);
            res.status(400)
            res.send({message: "Error fetching offense history recorded by police "+ req.params.policeId});

        }
        else{
            // console.log(result[0]);
        }
        res.json(result);
    })      
})

app.get("/police/offenses/:police_id", async(req, res) => {

    let query = 'select * from offender natural join offense where police_id = ? ';
    let queryString = mysql.format(query, [req.params.police_id]);
    conn.query(queryString, function(err, result){
        if(err){
            console.log(err);
            res.status(500);
            res.send({message: "Error fetching offense history recorded by police "+ req.params.policeId});

        }
        else{
            // console.log(result[0]);
        }
        res.json(result);
    })      
})

app.post("/police/offenses/new", async(req, res) => {
 
    let query = 'insert into offender(name, dl_no, vehicle_no, police_id, place, date, time, offense_no) values(?, ?, ?, ?, ?, ?, ?, ?);'
    let body = req.body;
    console.log(req.body);
    let formattedQuery = mysql.format(query, [body.name, body.dl_no, body.vehicle_no, body.police_id, body.place,  body.date, body.time, body.offense_no]);
    console.log(formattedQuery);

    conn.query(formattedQuery, function (err, result) {
        if(err){
            res.send(400, 'Error : Please check the input');
            console.log(err);
            return;
        }
        console.log(result);
        const id = result.insertId;
        console.log(id);
        if(body.email){
            let offenseData;
            query = 'select * from offender natural join offense where fine_no = ' + id + '; ';
            conn.query(query, function(err, result){
                if(err){
                    console.log(err);
                    res.send(500, 'Offense registered but unable to fetch details');
                }
                else{
                    offenseData = result[0];
                    console.log(offenseData);
                    var mailOptions = {
                        from: MY_EMAIL,
                        to: body.email,
                        subject: 'Traffic violation charges',
                        html: '<p>This notice is to inform you that you have been cited with a traffic violation.</p>' +
                             '<h3>Details</h3>' +
                            '    Name : ' + offenseData.name +
                            '    <br>' +
                            '    Vehicle Number : ' + offenseData.vehicle_no +
                            '    <br>' +
                            '    Offense : ' + offenseData.description +
                            '    <br>' +
                            '    Location : ' + offenseData.place +
                            '    <br>' +
                            '    Fine Amount : ' + offenseData.fine +
                            '    <br>' +
                            '' +
                            '' +
                            '    <br>' +
                            '    <br>' +
                            '    This email is sent from a traffic offense management system project for testing purposes only. Kindly ignore if received.' +
                            ''
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                            res.status(500).send('Email could not be sent. Please check the input');
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
            })

        }
        else{
            res.send('Offense successfully registered.');
        }
    });
})

app.post("/police/towing/new", async(req, res) => {
 
    let query = 'insert into towed_vehicles(vehicle_no, offense_no, station_id, place, time) values(?, ?, ?, ?, ?);'
    let body = req.body;
    console.log(req.body);
    let formattedQuery = mysql.format(query, [body.vehicle_no, body.offense_no, body.station_id, body.place, body.time]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.status(400);
            res.send({status : 'Error : Please check the input'})
            console.log(err)
        }
        else{
            res.send({status : "Successful registration"});
        }
    })
})

app.get("/offenses/user/:username", async(req, res) => {

    let query = 'select police_id,offender.offense_no,offense.fine,fine_no,place,offense.description,date from offender inner join user inner join offense on offender.vehicle_no=user.vehicle_no and offense.offense_no=offender.offense_no where user_id= ? order by date desc';
    let queryString = mysql.format(query, [req.params.username]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        res.json(result);
    })      
})

app.get("/offenses/tow/:username", async(req, res) => {

    let query = 'select user.vehicle_no,station_id,offense_no,fine_no,station_name,place,time,fine from user natural join towed_vehicles natural join police_station natural join offense where user_id= ? order by time desc';
    let queryString = mysql.format(query, [req.params.username]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        res.json(result);
    })      
})

app.get("/user/complaints/:userId", async(req, res) => {

    let query = 'select complaint_id, police_id,  station_id, description, status, date from complaints where user_id = ?';
    let queryString = mysql.format(query, [req.params.userId]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
        console.log(result);
        res.json(result);
    })     
})


app.get("/offenses/:dlNo", async(req, res) => {

    let query = 'select * from offender where dl_no = ?';
    let queryString = mysql.format(query, [req.params.dlNo]);
    conn.query(queryString, function(err, result){
        if(err)
            console.log(err);
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
              res.status(400);
              res.send({message:'Invalid user name'})
        }
        res.send({status:"Successful"})

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
            console.log(err);
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
            console.log(err);
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
            console.log(err);
        res.json(result);
        console.log(result)
    })     
})



const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = '=sadadwqduhaikukjhlkjodsufasyfasdgas';

function addAuthority(username, password, name, position) {
    return new Promise((resolve, reject) => {
        let query = 'insert into authority values(?,?,?,?)';
        bcrypt.hash(password, 10, function (err, hash) {
            let formattedQuery = mysql.format(query, [username, hash, name, position]);
            console.log(formattedQuery);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("Registration failed");
                    reject (false);
                } else {
                    console.log("Registration Success");
                    resolve(true);
                }
            }
            );
        });
    });
}

function genAccessToken(user) {
    const userId = user.id;
    const position = user.position;
    const role = user.role;
    const tokenPayload = { userId, position, role };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET_KEY);
    return accessToken;
}

function addPolice(police_id, station_id, name, age, username, password) {
    return new Promise((resolve, reject) => {
        let query = 'insert into police values(?,?,?,?,?,?)';
        bcrypt.hash(password, 10, function (err, hash) {
            let formattedQuery = mysql.format(query, [police_id, station_id, name, age, username, hash]);
            console.log(formattedQuery);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("Add police failed");
                    return false;
                } else {
                    console.log("Add police succeeded");
                    return true;
                }
            }
            );
        });
    });
}



function login(username, password) {
    return new Promise((resolve, reject) => {
        let query = 'select * from authority where username = ?';
        let formattedQuery = mysql.format(query, [username]);
        conn.query(formattedQuery, function (err, result) {
            if (err || result.length == 0) {
                console.log("Username does not exist");
                reject("Username does not exist");
            } else {
                bcrypt.compare(password, result[0].password, function (err, res) {
                    if (res) {
                        console.log("Login Success");
                        resolve({ name: result[0].name, position: result[0].position, role: "Admin" });
                    } else {
                        console.log("Login Failed");
                        reject("Password is incorrect");
                    }
                });
            }
        }

        );
    })

}

app.post('/admin/login', async (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    console.log(username, password)
    login(username, password).then(user => {
        const token = genAccessToken(user);
        response.json({ token });
    }).catch(error => {
        response.status(401).send(error);
    })

});

function authenticateToken(request) {
    return new Promise((resolve, reject) => {
        const accessToken = request.headers['authorization'];
        console.log(accessToken);
        jwt.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                console.log("Token is invalid");
                reject("Invalid Token");
            } else {
                if (decoded.role === "Admin") {
                    console.log("Authorized")
                    resolve(true)
                }
                else {
                    console.log("invalid token");
                    reject("invalid token")
                }
            }
        });
    })
}

app.get('/admin/auth', async (request, response) => {
    const accessToken = request.headers['authorization'];
    console.log(accessToken);
    jwt.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            response.status(403).send("You are not authorized to access this page");
        } else {
            if (decoded.role === "Admin") {
                console.log("Authorized")
                response.status(200).send(true);
            }
            else {
                response.status(403).send("You are not authorized to access this page");
            }
        }
    });
});

app.get('/admin/Authority', async (request, response) => {
    authenticateToken(request).then((res) => {
        console.log("Authorized for authority")
        if (res === true) {
            let query = 'select * from authority';
            let formattedQuery = mysql.format(query);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("No authority found");
                    response.status(404).send("No authority found");
                } else {
                    console.log(JSON.stringify(result))
                    response.status(200).send(result);
                }
            }
            );
        }
    }).catch(error => { console.log("Authority table error") })
})

app.get('/admin/Police', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res === true) {
            let query = 'select * from police';
            let formattedQuery = mysql.format(query);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("No Police found");
                    response.status(404).send("No police found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    }).catch(error => { console.log("Police table error") })
})

app.get('/admin/Stations', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res === true) {

            let query = 'select * from police_station';
            let formattedQuery = mysql.format(query);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("No stations found");

                    response.status(404).send("No stations found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    }).catch(error => { console.log("Station table error") })
})



app.get('/admin/Complaints', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res === true) {
            let query = 'select * from complaints';
            let formattedQuery = mysql.format(query);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("No Complaints found");
                    response.status(404).send("No complaints found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    }).catch(error => { console.log("Complaints table error") })
})

app.get('/admin/Offenses', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res === true) {
            let query = 'select * from offender inner join offense on offender.offense_no = offense.offense_no';
            let formattedQuery = mysql.format(query);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("No offenders found");
                    response.status(404).send("No offenders found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    }).catch(error => { console.log("Offenses table error") })
})

app.get('/admin/Camera', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res === true) {
            let query = 'select * from camera';
            let formattedQuery = mysql.format(query);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("No authority found");
                    response.status(404).send("No authority found");
                } else {
                    console.log("Authority found");
                    response.status(200).send(result);
                }
            }
            );
        }
    }).catch(error => { console.log("Camera table error") })
})
app.post('/admin/Authority/options', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res == true) {
            let query = `select * from authority where cast(${request.body.field} as char) like ?`;
            let formattedQuery = mysql.format(query, [request.body.text + "%"]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("No Authority found");

                    response.status(404).send("No Authority found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    })
})
app.post('/admin/Authority/add', async (request, response) => {
    console.log(JSON.stringify(request.body));
    authenticateToken(request).then((res) => {
        if(res){
            addAuthority(request.body.username, request.body.password, request.body.name, request.body.position).then((res) => {
                console.log("Added authority");
                response.send(true)
            }).catch(error => { response.status(404);console.log("Error adding authority") })
        }
    }).catch(error => { response.status(404);console.log(error) })
})


app.post('/admin/Authority/rem', async (request, response) => {
    console.log(JSON.stringify(request.body));
    authenticateToken(request).then((res) => {
        if(res){
            let query = 'delete from authority where username = ?';
            let formattedQuery = mysql.format(query, [request.body.username]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("authority delete error");

                    response.status(404).send("authority delete error");
                } else {
                    response.send(true);
                }
            }
            );
            
        }
    }).catch(error => { response.status(404);console.log(error) })
})


app.post('/admin/Police/rem', async (request, response) => {
    authenticateToken(request).then((res) => {
        if(res){
            let query = 'delete from police where police_id = ?';
            let formattedQuery = mysql.format(query, [parseInt(request.body.police_id)]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("police delete error");

                    response.status(404).send("police delete error");
                } else {
                    response.send(true);
                }
            }
            );
            
        }
    }).catch(error => { response.status(404);console.log(error) })
})

app.post('/admin/Stations/rem', async (request, response) => {
    authenticateToken(request).then((res) => {
        if(res){
            let query = 'delete from police_station where station_id = ?';
            let formattedQuery = mysql.format(query, [parseInt(request.body.station_id)]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("stations delete error");

                    response.status(404).send("stations delete error");
                } else {
                    response.send(true);
                }
            }
            );
            
        }
    }).catch(error => { response.status(404);console.log(error) })
})

app.post('/admin/Police/add', async (request, response) => {
    authenticateToken(request).then((res) => {
        if(res){
            let query = 'insert into police(station_id, name, dob, address, email, phone_no, username, password) values (?,?,?,?,?,?,?,?)';
            let formattedQuery = mysql.format(query, [parseInt(request.body.station_id), request.body.name, request.body.dob, request.body.address, request.body.email, request.body.phone_no, request.body.username, request.body.password]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("Police add error");

                    response.status(404).send("police add error");
                } else {
                    response.send(true);
                }
            }
            );
        }
    }).catch(error => { response.status(403);console.log("Police table add error") })
})

app.post('/admin/Stations/add', async (request, response) => {
    authenticateToken(request).then((res) => {
        if(res){
            let query = 'insert into police_station(station_name, station_address, pincode) values (?,?,?)';
            let formattedQuery = mysql.format(query, [request.body.station_name, request.body.station_address, request.body.pincode]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("Station add error");

                    response.status(404).send("Station add error");
                } else {
                    response.send(true);
                }
            }
            );
        }
    }).catch(error => { response.status(403);console.log("Station table add error") })
})

app.post("/admin/Offenses/add", async(req, res) => {
 
    let query = 'insert into offender(name, dl_no, vehicle_no, police_id, place, time, offense_no) values(?, ?, ?, ?, ?, ?, ?);'
    let body = req.body;
    console.log(req.body);
    let formattedQuery = mysql.format(query, [body.name, body.dl_no, body.vehicle_no, body.police_id, body.place, body.time, body.offense_no]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.status(404);
            res.send({status : 'Error : Please check the input'})
            console.log(err)
        }
        else{
            res.send(true)
        }
    })
})

app.post("admin/Complaints/add", async(req, res) => {

    let query = 'insert into complaints(user_id, police_id, station_id, description, date) values(?, ?, ?, ?, ?);'
    let body = req.body;
    let formattedQuery = mysql.format(query, [body.userId, body.policeId, body.stationId, body.description, body.date]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.status(404);
            console.log(err)
        }
        res.send(true)
        console.log('inserted into complaints')
    })
})

app.post("admin/Malfunction/add", async(req, res) => {

    let query = 'insert into malfunctions(userid, pincode, problem, descript,date) values(?, ?, ?, ?, ?);'
    let body = req.body;
    let formattedQuery = mysql.format(query, [body.userId, body.pincode, body.problem, body.descript, body.date]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.status(404);
            console.log(err)
        }
        res.send(true)
        console.log('inserted into malfunction');
    })
})

app.post("admin/Camera/add", async(req, res) => {

    let query = 'insert into camera(cid, clocation,ctoken) values(?, ?, ?);'
    let body = req.body;
    let formattedQuery = mysql.format(query, [body.cid, body.clocation, body.ctoken]);
    console.log(formattedQuery)
    conn.query(formattedQuery, function(err, result) {
        if(err){
            res.status(404);
            console.log(err)
        }
        res.send(true)
        console.log('inserted into camera');
    })
})

app.post('/admin/Police/options', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res == true) {
            let query = `select * from police where cast(${request.body.field} as char) like ?`;
            let formattedQuery = mysql.format(query, ["%" + request.body.text + "%"]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("No police found");

                    response.status(404).send("No police found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    })
})
app.post('/admin/Stations/options', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res == true) {
            let query = `select * from police_station where cast(${request.body.field} as char) like ?`;
            let formattedQuery = mysql.format(query, ["%" + request.body.text + "%"]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("No stations found");

                    response.status(404).send("No stations found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    })
})

app.post('/admin/Complaints/options', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res == true) {
            let query = `select * from complaints where cast(${request.body.field} as char) like ?`;
            console.log(query);
            let formattedQuery = mysql.format(query, ["%" + request.body.text + "%"]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("No complaints found");

                    response.status(404).send("No complaints found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    })
})
app.post('/admin/Offenses/options', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res == true) {
            let query = `select * from offender inner join offense on offender.offense_no = offense.offense_no where cast(${request.body.field} as char) like ?`;
            let formattedQuery = mysql.format(query, ["%" + request.body.text + "%"]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("No offenders found");

                    response.status(404).send("No offenders found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    })
})
app.post('/admin/Camera/options', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res == true) {
            let query = `select * from camera where cast(${request.body.field} as char) like ?`;
            let formattedQuery = mysql.format(query, ["%" + request.body.text + "%"]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("No stations found");

                    response.status(404).send("No stations found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    })
})
app.post('/admin/Malfunction/options', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res == true) {
            let query = `select * from malfunction where cast(${request.body.field} as char) like ?`;
            let formattedQuery = mysql.format(query, ["%" + request.body.text + "%"]);
            conn.query(formattedQuery, function (err, result) {
                if (err ) {
                    console.log("No malfunctions found");

                    response.status(404).send("No malfunctions found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    })
})
app.get('/admin/Malfunction', async (request, response) => {
    authenticateToken(request).then((res) => {
        if (res === true) {
            let query = 'select * from malfunction';
            let formattedQuery = mysql.format(query);
            conn.query(formattedQuery, function (err, result) {
                if (err || result.length == 0) {
                    console.log("No malfunctions found");
                    response.status(404).send("No malfunctions found");
                } else {
                    response.status(200).send(result);
                }
            }
            );
        }
    }).catch(error => { console.log("Offenses table error") })
})

