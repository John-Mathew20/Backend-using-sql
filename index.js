const { faker } = require("@faker-js/faker");
const sql = require("mysql2");
const express = require("express");
const app = express();
const port = 8090;
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "John@1411",
  database: "delta_app",
});

let getRandomuser = () => {
  return [faker.string.uuid()];
};

//home
app.get("/", (req, res) => {
  let q = `select count(*) from user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("index.ejs", { count });
    });
  } catch (error) {
    console.log(err);
  }
});

//user route
app.get("/users", (req, res) => {
  let q = `select * from user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("show.ejs", { users });
    });
  } catch (error) {}
});

//edit route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id ='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(err, result[0]);
      res.render("edit.ejs", { user });
    });
  } catch (error) {}
});

//update route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;
  let q = `select * from user where id ='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("wrong pass");
      } else {
        let newQ = `update user set username = "${newUsername}" where id = "${id}" `;
        connection.query(newQ, (err, result) => {
          if (err) throw err;
          res.redirect("/users");
        });
      }
    });
  } catch (error) {}
});

//adding new user
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});
app.post("/user/new", (req, res) => {
  let id = getRandomuser();
  let {
    username: formUsername,
    email: formEmail,
    password: formPass,
  } = req.body;
  let user = [id, formUsername, formEmail, formPass];
  let q = `insert into user(id,username,email,password) values (?,?,?,?);`;
  try {
    connection.query(q, user, (err, result) => {
      if (err) throw err;
      res.redirect("/users");
    });
  } catch (error) {}
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { email: formEmail, password: formPass } = req.body;
  let q = `select * from user where id = '${id}'`;
  let newQ = `delete from user where id ='${id}'`;
  connection.query(q, (err, result) => {
    if (err) throw err;
    let user = result[0];
    if (formEmail == user.email && formPass == user.password) {
      connection.query(newQ, (err, result) => {
        res.redirect("/users");
      });
    }
  });
});

app.listen(port, () => {
  console.log(`${port} app running`);
});
