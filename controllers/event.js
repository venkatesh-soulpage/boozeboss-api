import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendInviteCode } from './mailling'

// GET - Get a list of venues
const getEvents = async (req, res, next) => {
    
    try {    

        const {account_id} = req;
    
        // Validate the account is a client collaborator
        const agency_collaborators = 
            await models.AgencyCollaborator.query()
                .withGraphFetched(`[client]`)
                .where('account_id', account_id)
            
        const collaborator = agency_collaborators[0];
        if (!collaborator) return res.status(400).send('Invalid account');

        // Get brief events for the client  
        const briefs = 
            await models.Brief.query()
                .withGraphFetched(`
                    [
                        brief_events.[
                            event.[
                                guests.[
                                    role
                                ]
                            ], 
                            venue
                        ]
                    ]
                `)
                .where('client_id', collaborator.client.id)
                .where('status', 'APPROVED');
        
        // Get brief
        const events = []; 
        await briefs.map(brief => {
            brief.brief_events.map(be => {
                events.push(be);
            })
        })            

        // Send the clientss
        return res.status(200).send(events);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a user
const inviteGuest = async (req, res, next)  => {
    try { 
        const {account_id} = req;
        const {event_id, role_id, first_name, last_name, email, phone_number, send_email } = req.body;

        const code = Math.random().toString(36).substring(7).toUpperCase();
        // Validate if the user is a BoozeBoss user
        let guest_account;
        if (email) {
            const guests = 
                await models.Account.query()
                        .where('email', email);
            
                        guest_account = guests[0];
        }
        
        

        // If the user has a boozeboss account assign the account
        const event_guest =
            await models.EventGuest.query()
                .insert({
                    event_id, 
                    account_id: guest_account ? guest_account.id : null,
                    role_id,
                    first_name, 
                    last_name, 
                    email, 
                    phone_number,
                    code
                });        

        // If the send_email flag is enabled send an email.
        if (send_email) {

            const created_guest = 
                await models.EventGuest.query()
                    .withGraphFetched(`
                        [
                            event.[
                                brief_event.[
                                    venue
                                ]
                            ]
                        ]
                    `)
                    .findById(event_guest.id)
            await sendInviteCode(created_guest);
        }        

        return res.status(200).json('Guest created');


    } catch (e) { 
        // Send the clientss
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const resendEmail = async (req, res, next) => {
    try {
        const {event_guest_id} = req.params;

        const guest = 
            await models.EventGuest.query()
                        .withGraphFetched(`
                        [
                            event.[
                                brief_event.[
                                    venue
                                ]
                            ]
                        ]
                    `)
                    .findById(event_guest_id);

        if (!guest) return res.status(400).json('Invalid guest').send();

        await sendInviteCode(guest);
        return res.status(200).json('Success').send();

    } catch(e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const revokeEventGuest = async (req, res, next) => {
    try {
        const {event_guest_id} = req.params;

        await models.EventGuest.query()
                .deleteById(event_guest_id);

        return res.status(200).json('Succesfully removed');

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Guest
const getGuestEvents = async (req, res, next) => {
    try {
        const {account_id} = req;
        
        // Get the events where the user is a guest
        const guest_of_events = 
                await models.EventGuest.query()
                    .withGraphFetched('[event.[brief_event]]')
                    .where('account_id', account_id);        

        // Bring only the events with brief_events

        return res.status(200).send(guest_of_events); 
              
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}
 
const getCheckinToken = async (req, res, next) => {
    try {
        const {account_id} = req;
        const { event_id } = req.params;

        // Vaidate if the user is a event guest
        const guest_list = 
            await models.EventGuest.query()
                    .where('event_id', event_id)
                    .where('account_id', account_id);

        const guest = guest_list[0];
        if (!guest) return res.status(400).json("This account isn't on the guest list").send();

        // If the user is on the list generate a token
        const check_in_token = crypto.randomBytes(16).toString('hex');
        
        // Update the token
        await models.EventGuest.query()
                .update({
                    check_in_token
                })
                .where('event_id', event_id)
                .where('account_id', account_id);

        return res.status(200).json(check_in_token).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const checkInGuest = async (req, res, next) => {
    try {

        const {token} = req.params;

        // Validate token
        if (!token) return res.status(400).json('Invalid token').send();

        const event_guests = 
            await models.EventGuest.query()
                .withGraphFetched('[account, role]')
                .where('check_in_token', token);

        const guest = event_guests[0];

        if (!guest) return res.status(400).json('Invalid token').send();
        
        // Update guest Check-In
        await models.EventGuest.query()
                .update({
                    checked_in: true, 
                    check_in_time: new Date(),
                })
                .where('id', guest.id)

        // Return the gues with account
        return res.status(200).send(guest);
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const eventsController = {
    getEvents,
    getGuestEvents,
    inviteGuest,
    revokeEventGuest,
    resendEmail,
    getCheckinToken,
    checkInGuest
}

export default eventsController;