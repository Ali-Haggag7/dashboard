const express = require("express")
const connectToDb = require("./config/db")
require('dotenv').config()

// Connection To Db
connectToDb()

// Init App
const app = express()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/customers", require("./routes/customerRoutes"))
app.use("/api/deals", require("./routes/dealRoutes"))
app.use("/api/tasks", require("./routes/taskRoutes"))
app.use("/api/activities", require("./routes/activityRoutes"))

// Running The Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})