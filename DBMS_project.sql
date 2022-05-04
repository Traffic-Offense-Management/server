DROP DATABASE IF EXISTS project;
CREATE DATABASE project;
USE project;


drop view if exists offenses_today;
drop view if exists offenses_this_month;
drop table if exists towing_offenses;
drop table if exists authority;
drop table if exists break_and_run;
drop table if exists complaints;
drop table if exists towed_vehicles;
drop table if exists police;
drop table if exists police_station;
drop table if exists offender;
drop table if exists user;
drop table if exists malfunction;
drop table if exists offense;
drop table if exists vehicles;


CREATE TABLE authority(
    username varchar(20) UNIQUE PRIMARY KEY,
    password binary(32),
    name varchar(30),
    position varchar(50)
);

CREATE TABLE police_station(
    station_id int PRIMARY KEY AUTO_INCREMENT,
    station_name varchar(100),
    station_address varchar(100),
    pincode int CHECK(pincode>=100000 AND pincode<=999999)
);



CREATE TABLE police(
	police_id int PRIMARY KEY AUTO_INCREMENT,
    station_id int,
    name varchar(30),
    dob date,
    address varchar(100),
    email varchar(30) check(instr(email, '@') > 0 and right(email, 3) = 'com'),
    phone_no varchar(12),
    username varchar(20) UNIQUE,
    password varchar(32),
    FOREIGN KEY(station_id) REFERENCES police_station(station_id)
);


CREATE TABLE offense(
	offense_no int PRIMARY KEY AUTO_INCREMENT,
    description varchar(100),
    fine decimal(10,2)
);

CREATE TABLE towing_offenses(
    offense_no int,
    FOREIGN KEY(offense_no) REFERENCES offense(offense_no)
);


CREATE TABLE user(
	user_id varchar(10),
    name varchar(30),
    dl_no varchar(15),
    vehicle_no varchar(10),
    address varchar(100),
    phone decimal(10,0),
    password varchar(20),
    PRIMARY KEY(user_id)
);

CREATE TABLE vehicles(
	vehicle_no varchar(10) PRIMARY KEY,
    dl_no varchar(15),
    date datetime
);

CREATE TABLE offender(
    fine_no  int PRIMARY KEY AUTO_INCREMENT,
	name varchar(30) NOT NULL,
    dl_no varchar(15),
    vehicle_no varchar(10),
    police_id int,
    place varchar(100),
    date date,
    time time,
    offense_no int,
    status varchar(10),
    FOREIGN KEY (police_id) REFERENCES police(police_id),
    FOREIGN KEY (offense_no) REFERENCES offense(offense_no),
    FOREIGN KEY(vehicle_no) REFERENCES vehicles(vehicle_no)
);

CREATE TABLE towed_vehicles(
    fine_no int PRIMARY KEY AUTO_INCREMENT,
	vehicle_no varchar(10),
    offense_no int,
    station_id int,
    place varchar(100),
    time datetime,
    FOREIGN KEY(offense_no) REFERENCES offense(offense_no),
    FOREIGN KEY(vehicle_no) REFERENCES vehicles(vehicle_no),
    FOREIGN KEY(station_id) REFERENCES police_station(station_id)
);


CREATE TABLE complaints(
	complaint_id int PRIMARY KEY AUTO_INCREMENT,
    user_id varchar(10),
    police_id int,
    station_id int,
    description varchar(100),
    date datetime NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user(user_id),
    FOREIGN KEY (police_id) REFERENCES police(police_id),
    FOREIGN KEY(station_id) REFERENCES police_station(station_id)
);

CREATE TABLE break_and_run(
    fine_no int PRIMARY KEY AUTO_INCREMENT,
	vehicle_no varchar(10),
    police_id int,
    place varchar(100),
    date datetime,
    offense_no int,
    FOREIGN KEY (police_id) REFERENCES police(police_id),
    FOREIGN KEY(vehicle_no) REFERENCES vehicles(vehicle_no),
    FOREIGN KEY(offense_no) REFERENCES offense(offense_no)
);

create table malfunction(
    userid varchar(10),
    pincode int,
    problem varchar(100),
    descript varchar(200),
    date datetime,
    foreign key(userid) references user(user_id);
 )

insert into authority values('rakshith', 'mRak@2107', 'Rakshith Mohan', 'Secretary');
insert into authority values('abhishek', 'abh@321', 'Abhishek S', 'Managing Director');
insert into authority values('amogh', 'mRak@amg_1423', 'Amogh Umesh', 'Secretary');
insert into authority values('pratik', 'pratik_jal#213', 'Pratik Jallan', 'Deputy Commissioner');
insert into authority values('asim', 'assim_453#', 'Assim', 'Assistant Commisioner of Police    ');

insert into police_station values(1000, 'Mangalore Police Station', 'NH 66, Surathkal, Near Govinda Dasa College, Mangaluru, Karnataka', '575014');
insert into police_station values(1001,  'Chamarajpet Police Station', 'Albert Victor Road, Near-Vani Vilas Hospital, Chamarajpet, Bengaluru, Karnataka', '560018');
insert into police_station values(1002,  'JP Nagar Police Station', '21st Main Rd, R.K Colony, R K Colony, 2nd Phase, J. P. Nagar, Bengaluru, Karnataka', '560078');
insert into police_station values(1003,  'Lal Bagh Police Station', 'Lalbagh Gate, Lal Bagh Rd, Jaya Nagar, Mavalli, Bengaluru, Karnataka', '560004');
insert into police_station values(1004,  'Udupi Police Station', '76, Lombard Memorial Hospital Rd, near Mission Compound, Chitpady, Udupi, Karnataka', '576101');

insert into offense values(1, 'Driving without permission', 10000);
insert into offense values(2, 'Signal Jumping', 1000);
insert into offense values(3, 'Overspeeding', 3000);
insert into offense values(4, 'Driving without licence', 2000);
insert into offense values(5, 'Riding without helmet', 1000);
insert into offense values(6, 'Parking infront of No Parking', 3000);
insert into offense values(7, 'Vehicle abandoned', 8000);

insert into user  values ('ctong0', 'Connie Tong', '0043718043','KA01MN9876', '1 Brickson Park Circle', '1935596015','123');
insert into user  values ('rkinvig1', 'Robbie Kinvig', '4430701458','AP01JT5678', '17426 Bellgrove Lane', '1783902001','123');
insert into user  values ('gcraske2', 'Garvin Craske', '2339702895','KA56FR8907' ,'8 Burrows Terrace', '1436620221','123');
insert into user  values ('mschruy3', 'Moises Schruyers', '9258649087','KA32WE7865' ,'5 Lakeland Drive', '5186399426','123');
insert into user  values ('cwaterl4', 'Curt Waterland', '0636222330','TN09MK6754' ,'19 Orin Pass', '1038880536','123');
insert into user  values ('egeerts5', 'Elwood Geertsen', '7489426634','KA45RT9876' ,'2 Chive Street', '7621676435','123');
insert into user  values ('tivanov6', 'Tabina Ivanchikov', '5380131212','KAER326787', '3429 Norway Maple Way', '9763901450','123');
insert into user  values ('nbeagan7', 'Natalee Beagan', '4219077677', 'AP09UI7876','0 Jackson Point', '8291479133','123');
insert into user  values ('xbootyman8', 'Xavier Bootyman', '2144170525','MP90YU6543' ,'21 Larry Alley', '8178358688','123');
insert into user  values ('hfirmager9', 'Hakeem Firmager', '8747665033', 'DL67YT9087' ,'598 Carberry Trail', '2869996969','123');



insert into police values(10000, 1000, 'Chinnappa', '1966-06-03', 'NH 66, Surathkal, Near Govinda Dasa College, Mangaluru, Karnataka', 'chinnappa@gmail.com', '7878987890', 'chin123', 'sdfasdfds');
insert into police values(10001, 1001, 'Ram Prasad', '1966-06-03', 'NH 66, Surathkal, Near Govinda Dasa College, Mangaluru, Karnataka', 'chinnappa@gmail.com','7878987890', 'ram@3212', 'sdfgsg454');
insert into police values(10002, 1002, 'Hansoor', '1966-06-03', 'NH 66, Surathkal, Near Govinda Dasa College, Mangaluru, Karnataka', 'chinnappa@gmail.com', '7878987890','hansoor@78', 'ghjkdsfg78g');
insert into police values(10003, 1003, 'Ragini', '1966-06-03', 'NH 66, Surathkal, Near Govinda Dasa College, Mangaluru, Karnataka', 'chinnappa@gmail.com','7878987890', 'ragini2131', 'lyhsfcgvgs');
insert into police values(10004, 1004, 'Arvind', '1966-06-03', 'NH 66, Surathkal, Near Govinda Dasa College, Mangaluru, Karnataka', 'chinnappa@gmail.com', '7878987890','arv', 'abc');

insert into vehicles values('KA01MN9876', '4567456456', '2005-08-01');
insert into vehicles values('AP01JT5678', '0868687578', '2015-12-21');
insert into vehicles values('KA56FR8907', '0043718043', '2001-02-24');
insert into vehicles values('KA32WE7865', '7489426634', '2002-05-07');
insert into vehicles values('TN09MK6754', '8747665033', '2019-07-13');
insert into vehicles values('KA45RT9876', '8765478766', '2019-07-13');
insert into vehicles values('KAER326787', '8567845476', '2019-07-13');
insert into vehicles values('AP09UI7876', '9879345321', '2019-07-13');
insert into vehicles values('MP90YU6543', '0985665465', '2019-07-13');
insert into vehicles values('DL67YT9087', '8967234678', '2019-07-13');
insert into vehicles values('PJ65RT4567', '0732456576', '2019-07-13');


insert into offender values(1, 'Rakesh', '0868687578', 'KA32WE7865', 10000, 'JC Road, Bangalore', '2020-08-01', '12:03:08', 1, 'paid');
insert into offender values(2, 'Rakesh', '0868687578', 'KA32WE7865', 10001, 'MG Road, Bangalore', '2020-09-02', '03:03:08', 3, 'pending');
insert into offender values(3, 'Rakesh', '0868687578', 'KA32WE7865', 10001, 'MG Road, Bangalore', '2019-01-02' , '03:03:08', 3, 'paid');
insert into offender values(4, 'Harish', '0998765456', 'TN09MK6754', 10004, 'MG Road, Bangalore', '2019-01-02' , '03:03:08', 3, 'paid');
insert into offender values(5, 'Kadamba', '9876578999', 'TN09MK6754', 10004, 'MG Road, Bangalore', '2019-01-02',  '03:03:08', 3, 'paid');
insert into offender values(6, 'Sriraj', '0868687578', 'KA56FR8907', 10002, 'MG Road, Bangalore', '2019-01-02', '03:03:08', 3, 'pending');
insert into offender values(7, 'Srikanth', '5656564545', 'AP01JT5678', 10001, 'MG Road, Bangalore', '2019-01-02', '03:03:08', 3, 'pending');


insert into towed_vehicles values(1, 'PJ65RT4567', 6, 1000, 'Girinagar, Bangalore', '2020-08-01 12:03:08');
insert into towed_vehicles values(2, 'PJ65RT4567', 6, 1001, 'Marathalli, Bangalore', '2019-01-02 03:03:08');
insert into towed_vehicles values(3, 'DL67YT9087', 7, 1000, 'MG Road, Mangalore', '2012-01-02 03:03:08');
insert into towed_vehicles values(4, 'MP90YU6543', 6, 1003, 'Srinivasnagar, Surathkal', '2019-01-02 07:03:08');
insert into towed_vehicles values(5, 'AP09UI7876', 7, 1004, 'Gandhi Bazar Road, Bangalore', '2019-01-21 03:03:08');

insert into break_and_run values(1, 'KA01MN9876', 10000, 'Girinagar, Bangalore', '2020-08-01 05:04:09', 3);
insert into break_and_run values(2, 'KAER326787', 10003, 'MG Road, Bangalore', '2019-08-20 12:03:08', 3);
insert into break_and_run values(3, 'DL67YT9087', 10004, 'Indiranagar, Hubballi', '2006-04-01 03:03:08', 5);
insert into break_and_run values(4, 'MP90YU6543', 10004, 'JP Nagar, Shimoga', '2018-08-09 06:07:08', 1);
insert into break_and_run values(5, 'KA01MN9876', 10002, 'Bank Colony, Dharwad', '2022-12-31 12:03:30', 4);

insert into complaints values(1, 'gcraske2', 10001, 1000, 'Charging more fine than listed for traffic offences by threatening people', '2021-12-21 16:20:23');
insert into complaints values(2, 'egeerts5', 10001, 1000, 'Charging more fine than listed for traffic offences by threatening people', '2021-12-22 12:34:23');
insert into complaints values(3, 'nbeagan7', 10002, 1002, "Did not catch a person overspeeding just because he was the son of a minister", '2021-12-21 16:20:23');
insert into complaints values(4 , 'gcraske2', 10003, 1003, 'Seen riding without helmet', '2019-03-23 15:20:23');
insert into complaints values(5 , 'xbootyman8', 10004, 1004, 'Not regular in monitoring traffic', '2021-12-21 16:20:23');


insert into towing_offenses values(6);
insert into towing_offenses values(7);

create view offenses_today as
 select * from
 (select police.police_id, police.name, offender.offense_no, offender.status from police
 inner join offender on police.police_id = offender.police_id
 where offender.date = curdate()) as A natural join
 (select offense_no, fine from offense) as B;

create view offenses_this_month as
 select * from
 (select police.police_id, police.name, offender.offense_no, offender.status from police
 inner join offender on police.police_id = offender.police_id
 where month(offender.date) = month(curdate())) as A natural join
 (select offense_no, fine from offense) as B;


