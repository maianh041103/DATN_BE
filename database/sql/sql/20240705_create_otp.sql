CREATE TABLE otpEmail(
	id int primary key auto_increment,
	email nvarchar(100) not null,
    otp nvarchar(10) not null,
    status ENUM('active','inactive'),
    createdAt timestamp default current_timestamp not null,
    updatedAt timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

CREATE EVENT change_status_old_otp_email
ON SCHEDULE EVERY 1 MINUTE
DO
	UPDATE otpEmail
    SET status = 'inactive'
    WHERE createdAt < NOW() - INTERVAL 1 MINUTE;
