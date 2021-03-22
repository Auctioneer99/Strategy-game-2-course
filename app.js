const express = require("express");
const http = require("http");
const handlebars = require("express-handlebars").create({
  defaultLayout: false,
});
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const passport = require("passport");
require("./lib/passport.js")(passport);
const flash = require("connect-flash");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
const credentials = require("./lib/credentials.js");
const cookieParser = require("cookie-parser")();
const LobbyManager = require("./lib/game/LobbyManager.js");

mongoose
  .connect(credentials.mongo.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 2500;
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const LManager = new LobbyManager(io);
LManager.AddLobby("22");
LManager.AddLobby("11");

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));
app.use(cookieParser);
app.use(
  session({
    secret: credentials.cookieSecret,
    resave: true,
    saveUninitialized: false,
    store: new mongoStore({
      mongooseConnection: mongoose.connection,
    }),
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      sameSite: true,
      secure: false,
      httpOnly: true,
    },
  })
); // Express session
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use(require("./routes/AuthController.js"));
app.use(require("./routes/AdminController.js"));
app.use(require("./routes/IndexController.js")(LManager));

io.on("connection", (socket) => {
  let list = {},
    rc = socket.handshake.headers.cookie;
  rc &&
    rc.split(";").forEach(function (cookie) {
      let parts = cookie.split("=");
      list[parts.shift().trim()] = unescape(parts.join("="));
    });
  socket.session = list;
  let lobby = LManager.LobbyByName(socket.session.game);
  if (!lobby) {
    return socket.emit("nogame");
  }
  lobby.ConnectPerson(socket);
});

server.listen(PORT, console.log(`Server started on port ${PORT}`));
