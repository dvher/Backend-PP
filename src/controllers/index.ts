import { Request, Response } from 'express';
import db from '../database/db';
import argon2 from 'argon2';

const register = async (req: Request, res: Response) => {
    let { email, user, pass, confirmpass }: { email: string, user: string, pass: string, confirmpass: string } = req.body;
    if(!email || !user || !pass){
        res.status(400).json({status: 'ERROR', error: 'Parámetros inválidos'});
        return;
    }
    if(email.length === 0 || user.length === 0 || pass.length === 0){
        res.status(400).json({status: 'ERROR', error: 'Parámetros inválidos'});
        return;
    }
    if(pass != confirmpass){
        res.status(400).json({status: 'ERROR', error: 'Contraseñas no coinciden'});
        return;
    }
    if(pass.length < 10){
        res.status(400).json({status: 'ERROR', error: 'Contraseña muy corta'});
        return;
    }
    if(user.length > 20){
        res.status(400).json({status: 'ERROR', error: 'Nombre de usuario muy largo'});
        return;
    }
    let password = await argon2.hash(`${user}.${pass}`, {
        type: argon2.argon2i,
        timeCost: 25,
        hashLength: 45,
        memoryCost: 2048
    });
    let sent: boolean = false;
    db.query('SELECT user FROM pp_users WHERE user=? OR email=?;', [user, email], (err, results: any) => {
        if(err){
            !sent && res.status(400).json({status: 'ERROR', error: 'Ocurrió un error inesperado.'});
            sent = true;
        }else{
            if(results.length !== 0){
                !sent && res.status(400).json({status: 'ERROR', error: 'El usuario ya existe.'});
                sent = true;
            }else{
                db.query('INSERT INTO pp_users (email, user, password) VALUES (?, ?, ?);', [email, user, password], (err) => {
                    if(err){
                        res.status(400).json({status: 'ERROR', error: 'Ocurrió un error inesperado.'});
                        sent = true;
                        console.error(err);
                    }else{
                        !sent &&res.status(200).json({status: 'OK', error:''});
                    }
                });
            }
        }
    });
}

const login = async (req: Request, res: Response) => {
    let { user, pass }: { user: string, pass: string } = req.body;
    if(!user || !pass){
        res.status(400).json({status: 'ERROR', error: 'Parámetros inválidos'});
        return;
    }
    if(user.length === 0 || pass.length === 0){
        res.status(400).json({status: 'ERROR', error: 'Parámetros inválidos'});
        return;
    }
    if(user.length > 20){
        res.status(400).json({status: 'ERROR', error: 'Nombre de usuario muy largo'});
        return;
    }
    if(pass.length < 10){
        res.status(400).json({status: 'ERROR', error: 'Contraseña muy corta'});
        return;
    }
    let sent = false;

    const set = async (password: string, admin_status: boolean) => {
        let isValid = await argon2.verify(password, `${user}.${pass}`, {
            type: argon2.argon2i,
            timeCost: 25,
            hashLength: 45,
            memoryCost: 2048
        });
        if(isValid)
            !sent && res.status(200).json({status: admin_status ? 'OKADM' : 'OK', user, error: ''});
        else
            !sent && res.status(400).json({status: 'ERROR', user, error: 'Credenciales inválidas'});
    }
    
    db.query('SELECT password, isadmin FROM pp_users WHERE user=?;', [user], (err, results: any) => {
        if(err){
            res.status(400).json({status: 'ERROR', user, error: 'Ocurrió un error inesperado.'});
            sent = true;
            console.error(err);
        }else{
            if(results.length !== 0)
                set(results[0].password, results[0].isadmin);
            else
                res.status(400).json({status: 'ERROR', user, error: 'Credenciales inválidas'})
        }
    });
}

export {
    register,
    login
};