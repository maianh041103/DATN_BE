import {
    getNotificationList,
    getAllNotificationList,
    insertNotification,
    editNotification,
    deleteNotification,
} from './notifyController';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { createValidator } from './notifyValidator';

const express = require('express');

const router = new express.Router();

router.get('/', authenticate, getNotificationList);

router.get('/all', authenticate, getAllNotificationList);

// router.get('/:id', validator, authenticate, changeStatusReaded);

router.post('/',
    authenticate,
    (req, res, next) => { req.apiRole = 'notification_create'; next(); },
    authorize,
    createValidator,
    insertNotification
);


router.put('/:id',
    authenticate,
    (req, res, next) => { req.apiRole = 'notification_update'; next(); },
    authorize,
    createValidator,
    editNotification
);

router.delete('/:id',
    authenticate,
    (req, res, next) => { req.apiRole = 'notification_update'; next(); },
    authorize,
    deleteNotification
);

module.exports = router;

