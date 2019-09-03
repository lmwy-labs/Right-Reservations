const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'opentable'
  });

connection.connect(function(err) {
    if (err) { return console.log('error mysql connection ' + err)}
    console.log('connected to mysql');
});

const generateReservations = (numOfMonths, cb) => {

    const generateByMonth = (startDate) => {
        var reservations = [];
        const time_hour_min = [0, .5];
        for (var i = 1; i < 101; i ++) {
            const name = 'r' + i;
            const max_seats = Math.floor(Math.random()*(100-30)+30);
            const time_opening = (Math.floor(Math.random()*(19-11)+11) + time_hour_min[Math.floor(Math.random()*2)]);
            const time_closing = (Math.floor(Math.random()*(24-21)+21) + time_hour_min[Math.floor(Math.random()*2)]);
            var newDate = new Date(startDate);
            for (var j = 0; j < 30; j ++) {
                if (j === 0) {
                    newDate = new Date(startDate);
                } else {
                    newDate = new Date(newDate.setDate(newDate.getDate() + 1));
                }
                // generate 30min interval slots
                for (var k = time_opening; k < time_closing; k += .5) {
                    // generate random # open and reserved seats
                    var num_reserved_seats = Math.floor(Math.random()*(max_seats*.2) + (max_seats*.8));
                    var num_open_seats = max_seats - num_reserved_seats;
                    var reservation = [name, time_opening*10000, time_closing*10000, newDate, k*10000, num_open_seats, num_reserved_seats];
                    reservations.push(reservation);
                }
            }
        }
        connection.query({ sql: 'INSERT INTO reservations (name, time_opening, time_closing, calendar_date, calendar_time, num_open_seats, num_reserved_seats) VALUES ?', values: [reservations] }, (err, results, fields) => {
            if (err) return console.log(err);
            cb(null, 'Generated Reservations');
        });
    }

    const startDate = new Date('08/03/2019');
    var newDate = new Date(startDate);
    for (var x = 0; x < numOfMonths; x ++) {
        new Date(newDate.setDate(newDate.getDate() + 30));
        generateByMonth(newDate);
    }
}

// generateReservations(3, (err, message) => {
//     if (err) return console.log(err);
//     console.log(message);
// });


const getReservation = (rname, date, timeLower, timeUpper, cb) => {
    var data = [rname, date, timeLower, timeUpper];
    var sql = 'SELECT id, calendar_time, num_open_seats FROM reservations WHERE name = ? AND calendar_date = ? AND calendar_time BETWEEN ? AND ?'
    connection.query(sql, data, (err, results) => {
        if (err) return console.log(err);
        cb(null, results);
    });
}

// connection.end((err) => {
//     if (err) return console.log(err);
//     console.log('disconnected from mysql')
// });

module.exports = {
    getReservation
}