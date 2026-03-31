// middlewares/auth.middleware.js
'use strict'

const TokenHelper = require('../helpers/token.helper'); 

function auth(req, res, next) {


    if (!req.headers.authorization) {
        return res.status(401).json({
            result: 'KO',
            msg: 'Cabecera Authorization Bearer no encontrada'
        });
    }


    const token = req.headers.authorization.split(' ')[1];


    if (!token) {
        return res.status(401).json({
            result: 'KO',
            msg: 'Token no encontrado'
        });
    }


    TokenHelper.decodificaToken(token)
        .then(userId => {

            req.user = {
                id: userId,
                token: token
            };
            next();
        })
        .catch(err => {
            // Si token inválido o caducado
            res.status(err.status || 401).json({
                result: 'KO',
                msg: err.msg || 'Token inválido'
            });
        });
}

module.exports = {
    auth
};