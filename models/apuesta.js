const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ApuestaSchema = new Schema({

    monto: {
        type: Number,
        required: true
    },
    idApostador: {
        type: String,
        required: true
    },
    idCarrera: {
        type: String,
        required: true
    },
    idCaballo: {
        type: String,
        required: true
    }

}, { timestamps: true }).set('toJSON', {
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
});


const Apuesta = mongoose.model('apuesta', ApuestaSchema);
module.exports = Apuesta;