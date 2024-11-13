const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose")
const http = require("http").createServer(app);
const cors = require("cors")
require('dotenv').config()
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URI
const { MongoClient, ServerApiVersion } = require('mongodb');

const AuthController = require('./controllers/auth');
const Middleware = require('./middleware/auth-middleware');
const UsuarioController = require('./controllers/usuario');
const CaballoController = require('./controllers/caballo');
const CarreraController = require('./controllers/carrera');
const ApuestaController = require('./controllers/apuesta');


// Acceso a la DB 

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected");
    })
    .catch((err) => console.log(err));


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})
client.connect(err => {
    console.log(err)
    client.close();
});

app.use(cors())
app.use(express.json()); // Para utilizar json

http.listen(PORT, () => {
    console.log(`listening to ${PORT}`);
})


app.get("/", async (req, res) => {
    res.json({ message: "Bienvenidos ¡A apostar!" });
})

app.post("/auth/login", async (req, res) => {
    const mail = req.body.mail;
    const password = req.body.password;
    try {
        const result = await AuthController.login(mail, password);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(401).send("No puede estar aqui")
        }
    } catch (error) {
        res.status(500).send("Error");
    }
})

app.post("/registro", async (req, res) => {
    let nombre = req.body.nombre;
    let apellido = req.body.apellido;
    let dni = req.body.dni;
    let mail = req.body.mail;
    let role = req.body.role;
    let password = req.body.password;
    let medioDePago = req.body.medioDePago;

    console.log(req.body)


    try {
        const result = await UsuarioController.addUsuario(nombre, apellido, dni, mail, role, password, medioDePago);
        if (result) {
            res.status(201).send({ message: "El usuario se creó correctamente" });
        } else {
            res.status(409).send({ message: "No se pudo crear el usuario" });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Error al intentar crear el usuario" });
    }

})


app.post("/apostar", Middleware.verify, async (req, res) => {
    let monto = req.body.monto;
    let idApostador = req.body.idApostador;
    let idCarrera = req.body.idCarrera;
    let idCaballo = req.body.idCaballo;

    console.log("Body recibido:", req.body);
    console.log("Tipo de monto:", typeof monto, "Valor:", monto);

    if (typeof monto !== "number" || monto <= 0) {
        return res.status(400).json({ message: "El monto debe ser un número mayor a 0." });
    }

    if (!idApostador || !idCarrera || !idCaballo) {
        return res.status(400).json({ message: "Se deben proporcionar todos los datos necesarios: idApostador, idCarrera, idCaballo." });
    }

    if (!mongoose.Types.ObjectId.isValid(idApostador) ||
        !mongoose.Types.ObjectId.isValid(idCarrera) ||
        !mongoose.Types.ObjectId.isValid(idCaballo)) {
        return res.status(400).json({ message: "Uno o más ID no son válidos." });
    }

    try {
        const carrera = await CarreraController.getCarrera(idCarrera);
        if (!carrera) {
            return res.status(404).json({ message: "La carrera no existe." });
        }

        if (carrera.estado === 'Finalizada' || carrera.estado === 'En curso') {
            return res.status(400).json({ message: "No se puede apostar en una carrera que ya ha comenzado o que está finalizada." });
        }

        const ahora = new Date();
        if (carrera.fecha <= ahora) {
            return res.status(400).json({ message: "No se puede apostar en una carrera que ya ha comenzado." });
        }

        const usuario = await UsuarioController.getUsuario(idApostador);
        if (!usuario) {
            return res.status(404).json({ message: "El apostador no existe." });
        }

        const caballo = await CaballoController.getCaballo(idCaballo);
        if (!caballo) {
            return res.status(404).json({ message: "El caballo no existe." });
        }

        let caballoEnCarrera = false;
        console.log(carrera.listaCaballos);
        for (let i = 0; i < carrera.listaCaballos.length; i++) {
            if (carrera.listaCaballos[i].id && carrera.listaCaballos[i].id.toString() === idCaballo) {
                caballoEnCarrera = true;
                break;
            }
        }

        if (!caballoEnCarrera) {
            return res.status(400).json({ message: "El caballo seleccionado no participa en esta carrera." });
        }

        const apuesta = await ApuestaController.addApuesta(
            monto,
            idApostador,
            idCarrera,
            idCaballo
        );

        res.status(201).json(apuesta);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al crear la apuesta", error });
    }
});

app.post("/crear-caballo", Middleware.verify, Middleware.isAdmin, async (req, res) => {
    let nombreCaballo = req.body.nombreCaballo;
    let nombreJinete = req.body.nombreJinete;

    try {
        const result = await CaballoController.addCaballo(nombreCaballo, nombreJinete);
        if (result.success) {
            res.status(201).send({ message: "El caballo se creó correctamente" });
        } else {
            res.status(409).send({ message: result.message });
        }
    } catch (err) {
        res.status(500).send({ message: "Error al crear el caballo" })
        console.log(err)
    }

})

app.get("/caballos", async (req, res) => {
    let limit = req.query.limit;
    let offset = req.query.offset;
    try {
        const results = await CaballoController.getAllCaballos(limit, offset);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/usuarios", Middleware.verify, Middleware.isAdmin, async (req, res) => {
    let limit = req.query.limit;
    let offset = req.query.offset;
    try {
        const results = await UsuarioController.getAllUsuarios(limit, offset);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send(error)
    }
})

app.post("/crear-carrera", Middleware.verify, Middleware.isAdmin, async (req, res) => {
    let fecha = req.body.fecha;
    let estado = req.body.estado;
    let listaCaballos = req.body.listaCaballos;

    try {
        const result = await CarreraController.addCarrera(fecha, estado, listaCaballos);
        if (result.success) {
            res.status(201).send({ message: "La carrera se creó correctamente" });
        } else {
            res.status(409).send({ message: result.message });
        }
    } catch (err) {
        res.status(500).send({ message: "Error al crear la carrera" })
        console.log(err)
    }

})

app.get("/proximas-carreras", async (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.offset) || 0;

    try {
        const results = await CarreraController.getProximasCarreras(limit, offset);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send({ message: 'Error al obtener las próximas carreras', error });
    }
});

app.get("/total-apostado/:idCarrera", async (req, res) => {
    const { idCarrera } = req.params;
    try {
        const resultados = await ApuestaController.obtenerTotalApostadoPorCaballoYCarrera(idCarrera);
        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el total apostado' });
    }
});

app.post('/cargar-ganador', Middleware.verify, Middleware.isAdmin, async (req, res) => {
    const { idCarrera, idCaballoGanador } = req.body;

    const resultado = await CarreraController.cargarGanadorYCalcularGanancias(idCarrera, idCaballoGanador);

    if (resultado.error) {
        res.status(500).json({ error: resultado.error });
    } else {
        res.status(200).json(resultado);
    }
});

app.post("/agregarCaballoACarrera", Middleware.verify, Middleware.isAdmin, async (req, res) => {
    let idCarrera = req.body.idCarrera;
    let idCaballo = req.body.idCaballo;

    if (!idCarrera || !idCaballo) {
        return res.status(400).json({ message: "Se deben proporcionar los IDs de la carrera y del caballo." });
    }

    if (!mongoose.Types.ObjectId.isValid(idCarrera) || !mongoose.Types.ObjectId.isValid(idCaballo)) {
        return res.status(400).json({ message: "Uno o más ID no son válidos." });
    }

    try {
        const carrera = await CarreraController.getCarrera(idCarrera);
        if (!carrera) {
            return res.status(404).json({ message: "La carrera no existe." });
        }

        if (carrera.estado === 'Finalizada' || carrera.estado === 'En curso') {
            return res.status(400).json({ message: "No se puede agregar caballos a una carrera que ya ha comenzado o que está finalizada." });
        }

        const caballo = await CaballoController.getCaballo(idCaballo);
        if (!caballo) {
            return res.status(404).json({ message: "El caballo no existe." });
        }

        const caballoYaEnCarrera = carrera.listaCaballos.some(c => c.id.toString() === idCaballo);
        if (caballoYaEnCarrera) {
            return res.status(400).json({ message: "El caballo ya está registrado en esta carrera." });
        }

        carrera.listaCaballos.push({ id: idCaballo });

        await carrera.save();

        res.status(200).json({ message: "Caballo agregado exitosamente a la carrera." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al agregar el caballo a la carrera", error });
    }
});

app.post("/carrera/:id/cambiar-estado", Middleware.verify, Middleware.isAdmin, async (req, res) => {
    const carreraId = req.params.id;
    const nuevoEstado = req.body.estado;

    try {
        const carrera = await CarreraController.getCarrera(carreraId);

        if (!carrera) {
            return res.status(404).json({ message: "La carrera no existe." });
        }

        if (carrera.estado === "finalizada") {
            return res.status(400).json({ message: "No se puede cambiar el estado de una carrera finalizada." });
        }

        carrera.estado = nuevoEstado;
        await carrera.save();

        res.status(200).json({ message: "Estado de la carrera actualizado correctamente.", carrera });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado de la carrera.", error });
    }
});