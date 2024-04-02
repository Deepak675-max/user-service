const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        enum: ['CLIENT', 'MERCHANT'],
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema);