const express = require("express");
const app = express();
const port = process.env.PORT || 2000;
const cors = require("cors");
const mongoose = require("mongoose");
const shortid = require("shortid");
const Url = require("./url");
const utils = require("./util/util");
const dotenv = require("dotenv");
const url = require("./url");

dotenv.config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Db connected");
}).catch((err)=>{
    console.log(err);
});



app.get("/all",async (req,res)=>{
    url.find((err,data)=>{
        if(err){
            return next(err);
        }else{
            res.json(data);
        }
    });
})

app.post("/short",async (req,res)=>{
    console.log(req.body.url);
    const origUrl = req.body.url;
    const base = `http://localhost:2000`;
    
    const urlId = shortid.generate();

    if(utils.validateUrl(origUrl)){
        try{
            let url = await Url.findOne({origUrl});
            if(url){
                res.json(url);
            }else{
                const shortUrl = `${base}/${urlId}`;

                url = new Url({
                    urlId,
                    origUrl,
                    shortUrl,
                    date : new Date(),
                });
                await url.save();
                res.json(url);
            }
            }
            catch(err){
                console.log(err);
                res.status(500).json("Server Error");
            }
    }else{
        res.status(400).json("Invalid Original url");
    }
})

app.get("/:Id",async(req,res)=>{
    try{
        // console.log(urlId)
        const url = await Url.findOne({urlId: req.params.Id})

        console.log(url);

        if(url){
            url.clicks++;
            url.save();

            return res.redirect(url.origUrl);
            // return res.json(url.origUrl);
        }else{
            res.status(404).json("Not Found");
        }
    }catch(err){
        console.log(err);
        res.status(500).json("Server Error");
    }
});

app.listen(port,()=>{
    console.log(`Server Running on port ${port}`);
})