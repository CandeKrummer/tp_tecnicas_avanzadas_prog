require('mongoose');
const Usr = require('../models/usuario');


const addUsuario = async (nombre, apellido, dni, mail, role, password, medioDePago) => {
    console.log(nombre, apellido, dni, mail, role, password, medioDePago)


    let usuarioExiste = await Usr.findOne({ nombre: nombre });
    if (!usuarioExiste) {

        console.log("pass", password)

        const cryptoPassword = require('crypto')
            .createHash('sha256')
            .update(password)
            .digest('hex');

        const nuevoUsuario = new Usr(
            {
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                mail: mail,
                password: cryptoPassword,
                role: role,
                medioDePago : medioDePago,
                dinero : 0
            }
        );

        let usuario = await nuevoUsuario.save();
        console.log("usuario nuevo");
        console.log(usuario);
        return { usuario };

    } else {
        return false;
    }
}

const getAllUsuarios = async (limit, offset) => {

    const usuarios = await Usr.find({}).limit(limit).skip(offset);

    return usuarios;
}

const getUsuario = async (id) => {

    const usuario = await Usr.findById(id);

    return usuario;
}

const editUsuario = async (usuario) => {

    const result = await Usr.findByIdAndUpdate(usuario._id, usuario, { new: true });

    return result;
}

const deleteUsuario = async (id) => {

    const result = await Usr.findByIdAndDelete(id);

    return result;
}

module.exports = { addUsuario, getAllUsuarios, getUsuario, editUsuario, deleteUsuario }