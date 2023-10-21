const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');

dotenv.config();
const app = express();

const cordOption = {
    origin: "http://localhost:3000"
}

app.use(cors(cordOption));
app.use(bodyParser.json());

// parse request of content-type - application/json
app.use(express.json());
//parse request of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));


//connect mongodb
const db = require("./model");
const Role =db.role;

db.mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true, // option dùng để phân giải chuỗi kết nối
    useUnifiedTopology: true // option dùng để theo dõi sự kiện và trạng thái kết nối
}).then(() =>{
    console.log("Successfully connect to MongoDB.");
    initial();
}).catch(err =>{
    console.error("Connection error", err);
    process.exit();
})


//inital role user
function initial() {
    Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        new Role({
          name: "user"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'user' to roles collection");
        });
  
        
        new Role({
          name: "admin"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'admin' to roles collection");
        });
      }
    });
  }



//Router
app.get("/", (req, res) =>{
    res.json({message: "Application is running"});    
})

require('./routers/auth.router')(app);
require('./routers/user.router')(app);


const PORT = process.env.PORT || 8080 ;
app.listen(PORT, () =>{
    console.log("Server is running");
})
