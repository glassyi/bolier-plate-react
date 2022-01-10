const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require("body-parser");

const config = require("./config/key")

const { User } = require("./models/User")

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// application/json
app.use(bodyParser.json())

const mongoose = require("mongoose");

console.log(config);

mongoose
.connect(config.mongoURI, {
useNewUrlParser: true, useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected!!"))
  .catch((e) => console.log(e))

app.get('/', (req, res) => {
  res.send('Hello World ^^')
})

app.post('/register', (req, res) => {
  // 회원 가입 할때 필요한 정보들은 client에서 가져오면 그것들을 DB에 저장한다.
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

