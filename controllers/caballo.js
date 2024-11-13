require('mongoose');
const Caballo = require('../models/caballo');


const addCaballo = async (nombreCaballo, nombreJinete) => {

    let caballoExiste = await Caballo.findOne({ nombreCaballo: nombreCaballo });
    if (!caballoExiste) {

        const nuevoCaballo = new Caballo(
            {
                nombreCaballo: nombreCaballo,
                nombreJinete: nombreJinete,
            }
        );

        let caballo = await nuevoCaballo.save();
        console.log("caballo nuevo");
        console.log(caballo);
        return { caballo };

    } else {
        return false;
    }
}

const getAllCaballos = async (limit, offset) => {

    const caballos = await Caballo.find({}).limit(limit).skip(offset);

    return caballos;
}

const getCaballo = async (id) => {

    const caballo = await Caballo.findById(id);

    return caballo;
}

const editCaballo = async (caballo) => {

    const result = await Caballo.findByIdAndUpdate(caballo._id, caballo, { new: true });

    return result;
}

const deleteCaballo = async (id) => {

    const result = await Caballo.findByIdAndDelete(id);

    return result;
}

module.exports = { addCaballo, getAllCaballos, getCaballo, editCaballo, deleteCaballo }