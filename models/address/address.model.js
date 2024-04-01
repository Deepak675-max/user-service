const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    addressLine: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    postalCode: {
        type: Number,
        default: true
    },
    type: {
        type: String,
        enum: ["RESIDENCE", "SHIPPING"],
        require: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.isDeleted;
                delete ret.__v;
            }
        },
        timestamps: true
    }
)

module.exports = mongoose.model('Address', addressSchema);