export default function handler(req, res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Cancelled - Hebrew Master</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 60px 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 600px;
        }
        .icon {
            width: 100px;
            height: 100px;
            margin: 0 auto 30px;
            background: #fed7d7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        h1 {
            font-size: 36px;
            color: #2d3748;
            margin-bottom: 20px;
        }
        p {
            font-size: 18px;
            color: #718096;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            margin: 10px;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges were made to your account.</p>
        <a href="/pricing.html" class="btn">Try Again</a>
        <a href="/index.html" class="btn" style="background: white; color: #667eea; border: 2px solid #667eea;">Back to Home</a>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
