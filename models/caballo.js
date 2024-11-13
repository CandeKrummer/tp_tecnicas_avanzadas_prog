const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CaballoSchema = new Schema({

    nombreCaballo: {
        type: String,
        required: true
    },
    nombreJinete: {
        type: String,
        required: false
    }

}, { timestamps: true }).set('toJSON', {
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
});


const Caballo = mongoose.model('caballo', CaballoSchema);
module.exports = Caballo;