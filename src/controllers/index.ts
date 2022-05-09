import { Request, Response } from 'express';
import db, { escape } from '../database/db';
import argon2 from 'argon2';

const register = async (req: Request, res: Response) => {
    let { email, user, pass }: { email: string, user: string, pass: string } = req.body;
    if(email.length === 0 || user.length === 0 || pass.length === 0){
        res.status(400).json({status: 'ERROR', error: 'Invalid parameters'});
        return;
    }
    let password = await argon2.hash(`${user}.${pass}`, {
        type: argon2.argon2i,
        timeCost: 5,
        hashLength: 45
    });
    let sent: boolean = false;
    db.query('SELECT user FROM pp_users WHERE user=? OR email=?;', [escape(user), escape(email)], (err, results: any) => {
        if(err){
            !sent && res.status(400).json({status: 'ERROR', error: 'There was an unexpected error.'});
            sent = true;
        }else{
            if(results.length !== 0){
                !sent && res.status(400).json({status: 'ERROR', error: 'There was an unexpected error.'});
                sent = true;
            }else{
                db.query('INSERT INTO pp_users (email, user, password) VALUES (?, ?, ?);', [escape(email), escape(user), password], (err) => {
                    if(err){
                        res.status(400).json({status: 'ERROR', error: 'There was an unexpected error.'});
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
    if(user.length === 0 || pass.length === 0){
        res.status(400).json({status: 'ERROR', error: 'Invalid parameters'});
        return;
    }
    let sent = false;

    const set = async (password: string, admin_status: boolean) => {
        let isValid = await argon2.verify(password, `${user}.${pass}`, {
            type: argon2.argon2i,
            timeCost: 5,
            hashLength: 45
        });
        if(isValid)
            !sent && res.status(200).json({status: admin_status ? 'OKADM' : 'OK', user, error: ''});
        else
            !sent && res.status(400).json({status: 'ERROR', user, error: 'Invalid credentials'});
    }
    
    db.query('SELECT password, isadmin FROM pp_users WHERE user=?;', [escape(user)], (err, results: any) => {
        if(err){
            res.status(400).json({status: 'ERROR', user, error: 'There was an unexpected error.'});
            sent = true;
            console.error(err);
        }else{
            if(results.length !== 0)
                set(results[0].password, results[0].isadmin);
            else
                res.status(400).json({status: 'ERROR', user, error: 'Invalid credentials'})
        }
    });
}

export {
    register,
    login
};