const express = require("express");
const dotenv = require("dotenv");
const colorss = require("colors");
const morgan = require("morgan"); // log request and error
const connectDB = require(`./config/db`);
const fileupload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const bootcamps = require("./routes/bootcamps");
const cources = require("./routes/courses");
const path = require("path");
const auth = require("./routes/auth");
const user = require("./routes/user");
const review = require("./routes/review");

const cookieParser = require("cookie-parser");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

//body parser
app.use(express.json());

app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(fileupload());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", cources);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", user);
app.use("/api/v1/reviews", review);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log(`Server is running in ${process.env.NODE_ENV} mode on ${PORT}`)
);

// hnadle unhandled promise rejections

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error : ${err.message}`);
  //close server & exit process
  server.close(() => process.exit(1));
});
