const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CarreraSchema = new Schema({

    fecha: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        required: true
    },
    listaCaballos: [
        {
            type: Object,
            required: true
        }
    ],
    caballoGanador: {
        type: Object,
        required: false
    }

}, { timestamps: true }).set('toJSON', {
    transform: (document, object) => {
        object.id = document.id;
        delete object._id;
        delete object.password;
    }
});


const Carrera = mongoose.model('carrera', CarreraSchema);
module.exports = Carrera;