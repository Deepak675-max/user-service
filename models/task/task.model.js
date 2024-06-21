const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: "Pending"
    },
    description: {
        type: String,
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
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

module.exports = mongoose.model('Task', taskSchema);