const express = require('express');
const app = express();
const cors = require('cors');


require('dotenv').config(); //please put your PORT in .env file
app.use(express.json());
app.use(require('morgan')('dev'));
app.use(cors());

// app.use(
//   cors({
//     origin: "http://localhost:5173/",
//     credentials: true,
//   })
//);

// Health Check Endpoint
let errorLogs = []; // Store logs globally 

app.get("/api/health", (req, res) => {
  const hasErrors = errorLogs.length > 0;
  res.status(200).json({
    status: hasErrors ? "issues" : "ok",
    logs: errorLogs,
  });
});

// Log errors
app.use((err, req, res, next) => {
  errorLogs.push(err.message);
  res.status(500).json({ message: "Internal server error" });
});


// Mount the API router at /api
app.use("/api", require("./api/router"));

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status ?? 500;
    const message = err.message ?? 'Internal server error.';
    res.status(status).json({ message });
  });
  
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

