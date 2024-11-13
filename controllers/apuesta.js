require('mongoose');
const mongoose = require('mongoose');
const Apuesta = require('../models/apuesta');
const Caballo = require('../models/caballo');


const addApuesta = async (monto, idApostador, idCarrera, idCaballo) => {

    const nuevaApuesta = new Apuesta(
        {
            monto: monto,
            idApostador: idApostador,
            idCarrera: idCarrera,
            idCaballo: idCaballo
        }
    );

    let apuesta = await nuevaApuesta.save();
    console.log("apuesta nueva");
    console.log(apuesta);
    return { apuesta };

}

const getAllApuestas = async (limit, offset) => {

    const apuestas = await Apuesta.find({}).limit(limit).skip(offset);

    return apuestas;
}

const getApuestasByIdApostador = async (idApostador, limit, offset) => {

    const apuestas = await Apuesta.find({ idApostador: idApostador }).limit(limit).skip(offset);

    return apuestas;
}

const getApuestasByIdCarrera = async (idCarrera, limit, offset) => {

    const apuestas = await Apuesta.find({ idCarrera: idCarrera }).limit(limit).skip(offset);

    return apuestas;
}

const getApuesta = async (id) => {

    const apuesta = await Apuesta.findById(id);

    return apuesta;
}

const editApuesta = async (apuesta) => {

    const result = await Apuesta.findByIdAndUpdate(apuesta._id, apuesta, { new: true });

    return result;
}

const deleteApuesta = async (id) => {

    const result = await Apuesta.findByIdAndDelete(id);

    return result;
}

const obtenerTotalApostadoPorCaballoYCarrera = async (idCarrera) => {
    try {
        const apuestas = await Apuesta.find({ idCarrera });

        const totalPorCaballo = {};

        apuestas.forEach(apuesta => {
            const idCaballo = apuesta.idCaballo;
            if (totalPorCaballo[idCaballo]) {
                totalPorCaballo[idCaballo] += apuesta.monto;
            } else {
                totalPorCaballo[idCaballo] = apuesta.monto;
            }
        });

        const caballos = await Caballo.find({
            _id: { $in: Object.keys(totalPorCaballo) }
        });

        const resultados = caballos.map(caballo => ({
            idCaballo: caballo._id,
            nombreCaballo: caballo.nombreCaballo,
            totalApostado: totalPorCaballo[caballo._id.toString()]
        }));

        return resultados;
    } catch (error) {
        console.error(error);
        return [];
    }
};

module.exports = { addApuesta, getAllApuestas, getApuesta, editApuesta, deleteApuesta, getApuestasByIdApostador, getApuestasByIdCarrera, obtenerTotalApostadoPorCaballoYCarrera }