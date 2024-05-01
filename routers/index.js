const path=require('path');
require('dotenv').config({path:path.join(__dirname,'..','.env')});
console.log(process.env.TOKEN_SECRET);

const express=require('express');

const bodyParser=require('body-parser');
const jwt=require('jsonwebtoken');
const jsonParser=bodyParser.json();
const cookieParser=require('cookie-parser');

const jsend=require('jsend');
const fs=require('fs');

const app=express();
const port=3000;
const USERS_FILE=path.join(__dirname,'..','data','users.json');

//middleware
const verifyToken=require('../verifyToken');
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'..','public')));
app.use(jsend.middleware);
app.use('/bootstrap',express.static(path.join(__dirname,'..','node_modules','bootstrap','dist')));


const http=require('http');
const server=http.createServer(app);
const {Server}=require('socket.io');
const io=new Server(server);

//get users 
function getUsers() {
    const data=fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
}

let user;

//routers 
app.get('/',(req,res,next)=>{
    res.sendFile(path.join(__dirname,'..','view/index.html'));
    	
});

app.post('/login',(req,res,next)=> {
    const {email,password}=req.body;
    const users=getUsers();
    user=users.find(user=>user.email===email && user.password===password);
   
    console.log(user);
    if(!user) {
        return res.jsend.fail({
            statusCode:401,
            message:'Invalid email or password'
        })
    }
    console.log("actual user is "+user.name);

    //generate token 
    const token=jwt.sign({email:user.email,name:user.name},process.env.TOKEN_SECRET,{expiresIn:'5h'});
    
   
    res.cookie('token',token, {httpOnly:true}).redirect(`/chat?name=${encodeURIComponent(user.name)}`);
});

app.get('/chat',verifyToken,(req,res,next)=> {
    //res.sendFile(path.join(__dirname,'..','view/chatpage.html'));
    res.sendFile(path.join(__dirname,'..','view/newchat.html'));
});


app.get('/signup',(req,res,next)=> {
    console.log ("signup");
    res.sendFile(path.join(__dirname,'..','view/signup.html'));
})

// Authentication middleware for socket.io
io.use((socket, next) => {
    let token;
    // Extract token from the query or from cookies
    if (socket.handshake.query && socket.handshake.query.token) {
        token = socket.handshake.query.token;
    } else if (socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
            const parts = cookie.split('=');
            acc[parts[0].trim()] = decodeURIComponent(parts[1]);
            return acc;
        }, {});
        token = cookies['token'];
    }

    // Verify the token
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                next(new Error('Authentication error'));
            } else {
                socket.user = decoded; // Attach user info to the socket
                next();
            }
        });
    } else {
        next(new Error('Authentication error')); // No token found
    }
});

const onlineUsers={};



io.on('connection', (socket) => {
    if (socket.user && socket.user.name) {
        // Add user to the online list using socket ID for easy removal later
        onlineUsers[socket.id] = socket.user.name;
        // Emit updated user list to all clients
        io.emit('online users', Object.values(onlineUsers));
        
    }

    socket.on('chat message', (msg) => {
        // Broadcast message with user information
        io.emit('chat message', { text: msg, name: socket.user.name, email: socket.user.email });
        console.log("socket user",socket.user)
    });

    socket.on('disconnect', () => {
        // Remove user from online list on disconnect
        delete onlineUsers[socket.id];
        // Emit updated user list to all clients
        io.emit('online users', Object.values(onlineUsers));
        console.log('User disconnected');
    });
});






server.listen(port,()=> {
    console.log("server is running on port 3000");
})