import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

app.get("/", (req,res,next) =>{
  console.log(req.method);
  res.send("Ishtay");
});

app.post("/", (req,res,next) =>{
  console.log(req.body);
  res.send("post");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});