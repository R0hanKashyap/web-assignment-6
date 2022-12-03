const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    userName : {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [ 
        { 
            dateTime: Date, 
            userAgent: String 
        } 
    ]
});

let User 

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://webassign6:rohankashyap@senecaweb.foimuu9.mongodb.net/?retryWrites=true&w=majority");
        db.on('error', (err)=>{
            reject(err); 
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser =  function(userData){
    const { userName, userAgent, email, password, password2 } = userData;
    return new Promise(async function(resolve, reject){
        if(password !== password2){
            reject({ message: 'Passwords do not match' }); 
        } else {

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                userData.password = hashedPassword;
            } catch (error) {
                reject({ message: 'There was an error encrypting the password' }); 
            }

            let newUser = new User(userData)

            newUser.save().then(() => {
                resolve()
            }).catch((err)=> {
                if(err.code === 11000){
                    reject({ message: 'User Name already taken' })
                } else {
                    reject({ message: `There was an error creating the user: ${err}` })
                }
            })
        }
    })
}

module.exports.checkUser = function(userData){
    const { userName,  password } = userData;
    return new Promise(function(resolve, reject){

        User.find({ userName }).then((users) => {
            if(users.length === 0){
                reject({ message: `Unable to find user: ${userName}` })
            }

            bcrypt.compare(password, users[0].password).then((result) => {
                if(result){
                    users[0].loginHistory.push({
                        dateTime: (new Date()).toString(), 
                        userAgent: userData.userAgent
                    })
                    User.updateOne(
                        { userName }, 
                        { $set: { loginHistory : users[0].loginHistory }},
                        {new : true}
                    ).exec().then(() => {
                        resolve(users[0])
                    }).catch((err) => {
                        reject({ message: `There was an error verifying the user: ${err}` })
                    })
                } else {
                    reject({ message: `Incorrect Password for user: ${userName}` })
                }
            });

            

        }).catch((err) => {
            reject({ message: `Unable to find user: ${userName}` })
        })
    })
}