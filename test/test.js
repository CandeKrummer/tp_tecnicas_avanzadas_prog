const { default: axios } = require('axios');
const chai = require('chai')
const dotenv = require("dotenv").config();
const { assert } = chai;
const url = "http://localhost:" + process.env.PORT || 5000;

describe('Cargar una apuesta', () => {
    let token;
    let carreraTerminada;
    let carreraProgramada;
    let idUsuario;
    let caballo;
    let apuestaId;

    it('Login de admin', function (done) {
        this.timeout(5000);
        axios.post(url + "/auth/login", {
            mail: "admin@admin.com",
            password: "admin"
        }).then(response => {
            assert.equal(response.status, 200);
            token = response.data.token;
            idUsuario = response.data.user.id;
            done();
        }).catch(err => {
            done(err);
        });
    });

    it('Crear caballo como admin', function (done) {
        this.timeout(5000);
        axios.post(url + "/crear-caballo", {
            nombreCaballo: "Caballo test",
            nombreJinete: "Jinete test"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 201);
            console.log(response.data);
            caballo = response.data.caballo;
            done();
        }).catch(err => {
            done(err);
        });
    });

    it('Devuelve 201 si creó la carrera terminada correctamente', function (done) {
        this.timeout(10000);
        axios.post(url + "/crear-carrera", {
            fecha: "2024-09-14T17:00:00.000+00:00",
            estado: "Finalizada",
            listaCaballos: [caballo]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 201);
            carreraTerminada = response.data.carrera;
            done();
        }).catch(err => {
            assert.equal(err.response.status, 201);
            done();
        });
    });

    it('Devuelve 201 si creó la carrera programada correctamente', function (done) {
        this.timeout(5000);
        axios.post(url + "/crear-carrera", {
            fecha: "2024-11-14T17:00:00.000+00:00",
            estado: "Programada",
            listaCaballos: [caballo]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 201);
            carreraProgramada = response.data.carrera;
            done();
        }).catch(err => {
            assert.equal(err.response.status, 201);
            done();
        });
    });

    it('Devuelve error si se intenta hacer una apuesta para una carrera terminada', function (done) {
        this.timeout(5000);
        axios.post(url + "/apostar", {
            monto: 100,
            idApostador: idUsuario,
            idCarrera: carreraTerminada.id,
            idCaballo: caballo.id
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("Debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 400);
            done();
        });
    });

    it('Devuelve error si el monto apostado es negativo', function (done) {
        this.timeout(5000);
        axios.post(url + "/apostar", {
            monto: -100,
            idApostador: idUsuario,
            idCarrera: carreraProgramada.id,
            idCaballo: caballo.id
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("Debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 400);
            done();
        });
    });

    it('Devuelve error si la carrera no existe', function (done) {
        this.timeout(5000);
        axios.post(url + "/apostar", {
            monto: 100,
            idApostador: idUsuario,
            idCarrera: "1234",
            idCaballo: caballo.id
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("Debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 400);
            done();
        });
    });

    it("Devuelve error si el caballo no forma parte de esa carrera", function (done) {
        this.timeout(5000);
        axios.post(url + "/apostar", {
            monto: 100,
            idApostador: idUsuario,
            idCarrera: carreraProgramada.id,
            idCaballo: "1234"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("Debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 400);
            done();
        });
    });

    it('Realizar apuesta', (done) => {
        axios.post(url + "/apostar", {
            monto: 100,
            idApostador: idUsuario,
            idCarrera: carreraProgramada.id,
            idCaballo: caballo.id
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 201);
            apuesta = response.data;  // Guarda toda la apuesta
            apuestaId = apuesta.id;  // Accede a la id si es necesario
            done();
        }).catch(done);
    });

    it('Eliminar apuesta', (done) => {
        axios.delete(url + "/eliminar-apuesta", {
            data: { idApuesta: apuestaId },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 200);
            done();
        }).catch(done);
    });

    it('Eliminar caballo', (done) => {
        axios.delete(url + "/eliminar-caballo", {
            data: { idCaballo: caballo.id },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 200);
            done();
        }).catch(done);
    });

    it('Eliminar carrera programada', (done) => {
        axios.delete(url + "/eliminar-carrera", {
            data: { idCarrera: carreraProgramada.id },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 200);
            done();
        }).catch(done);
    });

    it('Eliminar carrera terminada', (done) => {
        axios.delete(url + "/eliminar-carrera", {
            data: { idCarrera: carreraTerminada.id },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 200);
            done();
        }).catch(done);
    });

});