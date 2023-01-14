const express = require('express');
const mongoose = require('mongoose');
const rooms = require('./dbRooms');
const cors = require('cors');
const messages = require('./dbMessages');
const Pusher = require("pusher");
const env = require('dotenv').config();
const dbURL = process.env.dbURL
const app = express();


const pusher = new Pusher({
    appId: "1537879",
    key: "6e68f2047bc3e3f5d09d",
    secret: "d6acf253d64eac53748d",
    cluster: "ap2",
    useTLS: true
  });


app.use(express.json());
app.use(cors({
    origin : "https://capable-gelato-a223ec.netlify.app"
}))


mongoose.connect(dbURL);

const db = mongoose.connection;

db.once('open',()=>{
    console.log("db connected"); // Event listener(once the connection open)
    const roomCollection = db.collection('rooms');
const changeStream = roomCollection.watch();
changeStream.on('change',(change)=>{

    if(change.operationType === "insert"){
        const roomDetails = change.fullDocument;
        pusher.trigger("rooms", "inserted",roomDetails); // from pusher website (model)
    }else{
        console.log("not expected event to trigger")
    }

});

const messageCollection = db.collection('messages');
const changeStream1 = messageCollection.watch();
changeStream1.on('change',(change)=>{
    console.log(change);
    if(change.operationType === "insert"){
        const messageDetails = change.fullDocument;
        pusher.trigger("messages", "inserted",messageDetails);  // from pusher website (model)
    }else{
        console.log("not expected event to trigger")
    }
})



})

app.get("/",(req,res)=>{
res.json('hello')
})

app.post('/messages/new',(req,res)=>{
    const dbMessage = req.body;
    messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            return res.status(201).send(data);
        }
    })
})


app.get('/all/rooms',(req,res)=>{
    rooms.find({},(err,data)=>{
        if(err){
            return res.status(500).send(err);
        }else{
            return res.status(200).send(data);
        }
    })
})

app.get('/room/:id',(req,res)=>{
    rooms.find({_id:req.params.id},(err,data)=>{
        if(err){
            return res.status(500).send(err)
        }else{
            return res.status(200).send(data[0]);
        }
    })
})

app.post('/group/create',(req,res)=>{
    const name = req.body.groupName;
    rooms.create({name},(err,data)=>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            return res.status(201).send(data);
        }
    })
})


app.get('/messages/:id',(req,res)=>{
    messages.find({roomId: req.params.id},(err,data)=>{
        if(err){
            return res.status(500).send(err)
        }else{
            return res.status(200).send(data);
        }
    })
})


app.listen(process.env.PORT || 5000,()=>{
    console.log("server running in port 5000")
});