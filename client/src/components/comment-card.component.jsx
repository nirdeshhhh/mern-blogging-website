
//model
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "username required"]
    },

    email: {
        type: String,
        required: [true, "username required"]
    },

    Password: {
        type: String,
        required: [true, "username required"]
    }

})


const User = mongoose.model("user", userSchema)
module.export = User;



//controller
const model = require("../modle");
const bcrypt = require("bcryptjs")


exports.signUp = async(req, res) => {
    try{

        const {userName, email, Password} = req.body;

        const hashedPassword = await bcrypt.hash(Password, 12);

        const newUser = await User.create({
            userName,
            email,
            Password: hashedPassword
        })
        res.status(200).json({
            status: "success",
            data: {
                uesr: newUser
            }
    });
    }catch(err){
        dfndfn
    }
}

exports.signin = async(req, res) => {

    const {email, Password} = req.body;
    const user = await User.findOne({email});

    if(!user){
        res.status(404).json({
            status: "failed",
            msg: "invalid email id"
        })
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if(isMatch){
        res.status(200).json({
            status: "success",
            data: {
                user: username,
                email: email
            }
        })

    }else{
        res.status(404).json({
            faidlsdnfn
        })
    }

}