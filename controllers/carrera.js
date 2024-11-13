require('mongoose');
const Carrera = require('../models/carrera');
const Apuesta = require('../models/apuesta');
const Usuario = require('../models/usuario');


const addCarrera = async (fecha, estado, listaCaballos) => {

    const nuevaCarrera = new Carrera(
        {
            fecha: fecha,
            estado: estado,
            listaCaballos: listaCaballos,
            caballoGanador: {}
        }
    );

    let carrera = await nuevaCarrera.save();
    console.log("carrera neuva");
    console.log(carrera);
    return { carrera };

}

const getAllACarreras = async (limit, offset) => {

    const carreras = await Carrera.find({}).limit(limit).skip(offset);

    return carreras;
}

const getCarrera = async (id) => {

    const carrera = await Carrera.findById(id);

    return carrera;
}

const editCarrera = async (carrera) => {

    const result = await Carrera.findByIdAndUpdate(carrera._id, carrera, { new: true });

    return result;
}

const deleteCarrera = async (id) => {

    const result = await Carrera.findByIdAndDelete(id);

    return result;
}

const getProximasCarreras = async (limit, offset) => {
    const hoy = new Date();
    const carreras = await Carrera.find({
        fecha: { $gt: hoy },
        estado: { $nin: ["Finalizada", "En curso"] }
    })
    .limit(limit)
    .skip(offset);

    return carreras;
};

const cargarGanadorYCalcularGanancias = async (idCarrera, idCaballoGanador) => {
    try {
        const carrera = await Carrera.findById(idCarrera);
        if (!carrera) {
            return { error: 'La carrera no existe' };
        }

        if (carrera.estado === 'Finalizada') {
            return { error: 'La carrera ya está finalizada y no se puede cargar un ganador' };
        }

        const apuestas = await Apuesta.find({ idCarrera });

        const totalApostadoCaballoGanador = apuestas
            .filter(apuesta => apuesta.idCaballo.toString() === idCaballoGanador)
            .reduce((total, apuesta) => total + apuesta.monto, 0);

        const totalApostadoEnCarrera = apuestas.reduce((total, apuesta) => total + apuesta.monto, 0);

        const ganancias = [];
        for (let apuesta of apuestas) {
            if (apuesta.idCaballo.toString() === idCaballoGanador) {
                const porcentajeApostado = apuesta.monto / totalApostadoCaballoGanador;
                const ganancia = porcentajeApostado * totalApostadoEnCarrera;
                
                const apostador = await Usuario.findById(apuesta.idApostador);
                if (apostador) {
                    apostador.dinero += ganancia;

                    await apostador.save();

                    ganancias.push({
                        apostador: apostador.nombre,
                        ganancia
                    });
                }
            }
        }

        const fechaActual = new Date(); 
        const carreraActualizada = await Carrera.findByIdAndUpdate(
            idCarrera,
            {
                caballoGanador: idCaballoGanador,
                estado: 'Finalizada',
                fecha: fechaActual 
            },
            { new: true }
        );

        return {
            carrera: carreraActualizada,
            ganancias
        };
    } catch (error) {
        console.error(error);
        return { error: 'Hubo un error al procesar la carrera, las ganancias o la actualización de los usuarios' };
    }
};

module.exports = { addCarrera, getAllACarreras, getCarrera, editCarrera, deleteCarrera, getProximasCarreras, cargarGanadorYCalcularGanancias}