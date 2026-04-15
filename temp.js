import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("server running fine");
});
const temp = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Simple Animation</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    //   background: #111;
    }

    .ball {
      width: 80px;
      height: 80px;
      background: #4CAF50;
      border-radius: 50%;
      animation: bounce 1s infinite ease-in-out;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-150px);
      }
    }
  </style>
</head>
<body>
  <div class="ball"></div>
</body>
</html>`
app.get("/code",async(req,res)=>{

    const code = await axios.get("https://69de4819410caa3d47baef0c.mockapi.io/ifram/html/6");
   console.log(code.data);
   res.setHeader("Content-Type","text/html");
//    res.send(code.data.data)
   res.send(temp)
   res.send("ok")
})

app.listen(3000,()=>{
    console.log("server starter check on 3000")
})
