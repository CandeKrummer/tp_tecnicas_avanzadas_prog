require('mongoose');
const Caballo = require('../models/caballo');


const addCaballo = async (nombreCaballo, nombreJinete) => {
    let caballoExiste = await Caballo.findOne({ nombreCaballo: nombreCaballo });
    if (!caballoExiste) {
        const nuevoCaballo = new Caballo({ nombreCaballo, nombreJinete });
        let caballo = await nuevoCaballo.save();
        return { caballo };
    } else {
        return false;
    }
};

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

const deleteCaballo = async (idCaballo) => {
    try {
        const result = await Caballo.findByIdAndDelete(idCaballo);
        if (!result) {
            return { success: false, message: "Caballo no encontrado" };
        }
        return { success: true, message: "Caballo eliminado correctamente" };
    } catch (err) {
        console.error("Error al eliminar el caballo:", err);
        return { success: false, message: "Error al eliminar el caballo" };
    }
};

module.exports = { addCaballo, getAllCaballos, getCaballo, editCaballo, deleteCaballo }