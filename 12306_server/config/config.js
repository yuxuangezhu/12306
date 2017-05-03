var conn = {
	host: '',//远程MySQL数据库的ip地址
	user: '',
	password: '',
	database: 'test',
	port: '3306',
};
var mysql = require('mysql');

var pool  = mysql.createPool({
	connectionLimit: 10,
	host: conn.host,
	user: conn.user,
	password: conn.password,
	database: conn.database,
	port: conn.port,
	dateStrings: true,
	supportBigNumbers: true,
	bigNumberStrings: true,
	multipleStatements: true,
	insecureAuth: true
});

pool.doQuery = function(sql, callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			callback({
				data: err,
				code: 'A00001'
			});
		}

		var query = connection.query(sql, function(err, rows, fields) {
			if (err) {
				callback({
					data: err,
					code: 'A00001'
				});
			}
			if (typeof callback == 'function') {
				callback({
					data: {
						rows: rows,
						fields: fields
					},
					code: 'A00000'
				});
			}
			connection.release();
		});
	});
};

module.exports = pool;
