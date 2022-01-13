const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

const dbName = "myFirstDatabase"

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// application/json
app.use(bodyParser.json())
app.use(cookieParser());

const mongoose = require("mongoose");

mongoose
  .connect(config.mongoURI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName
    }
  )
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

app.post('/login', (req, res) => {
  // 요청된 이메일을 DB에 있는지 찾기.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

    // 요청된 이메일이 DB에 있다면 비밀번호가 유효한지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다."
      })

      // 비밀번호까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등등...
        res.cookie("x_auth", user.token)
          .status(200)
          .json({loginSuccess: true, userId: user._id})
      })
    })
  })
})


// role 1 어드민, role 2 특정부서 어드민
// role 0 일반유저, 0이 아니면 관리자
app.get('api/users/auth', auth, (req, res) => { // auth (middleware)
  // 여기까지 미들웨어 통과해 온것은 Authentication 이 True 라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "" },
    (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    }
  )
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

