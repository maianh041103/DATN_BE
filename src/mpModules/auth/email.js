module.exports.email = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #e0f7fa; 
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #ffffff; 
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            margin: auto;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #00796b; 
            margin: 20px 0;
        }
        .message {
            font-size: 16px;
            color: #666666;
        }
        .footer {
            font-size: 12px;
            color: #aaaaaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Mã xác thực OTP</h2>
        <p class="otp-code">${otp}</p>
        <p class="message">Mã OTP sẽ hết hạn trong 1 phút.</p>
        <div class="footer">
            <p>Nếu bạn không yêu cầu lấy lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
    </div>
</body>
</html>`
}