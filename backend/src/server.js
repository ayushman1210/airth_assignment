const express = require('express');
const dotenv = require('dotenv');
const jobsRouter = require('./routes/jobs_route');
const { db } = require('./config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/jobs', jobsRouter);

app.use((error, req, res, next) => {
    console.error(error.message);
    res.status(500).json({ message: 'something went wrong' });
});


app.get('/',(req,res)=>{
console.log('hello world')
res.status(200).json({
    message:"thank u airth team for the opportunity"
})
})
//keeping the server up all time

setInterval(async()=>{
const ping =await fetch("http://localhost:3000/")
console.log(ping)
},5000)


const server = app.listen(port, () => {
    console.log(`server started on port ${port}`);
});


//gracefully shutting down backend 

let shuttingDown = false;

function shutdown() {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    server.close(() => {
        db.close((error) => {
            if (error) {
                console.error('could not close database', error.message);
                process.exit(1);
            }

            process.exit(0);
        });
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);