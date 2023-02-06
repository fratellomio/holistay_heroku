const database = require("../models")
const { Op, Sequelize } = require("sequelize");
// const fs = require("fs");
// const path = require("path");
// const puppeteer = require('puppeteer');
// const nodemailer = require('../middlewares/nodemailer');
// const handlebars = require("handlebars");

module.exports = {
    reportTransactions: async (req, res) => {
        const {tenantId, search, order, order_direction, limit, start, end, page, transactionStatus} = req.query
        const startedDate = start ? new Date(start) : null
        const endDate = end ? new Date(end) : new Date(start)
        const offset = (page * limit) - limit
        console.log(req.query)
        try{

            const rows = await database.transaction.count({
                where: { 
                    [Op.and]: [
                        {
                            checkIn: startedDate ? {[Op.between]: [startedDate, endDate]} : {[Op.not]: null} 
                        },
                        {
                            transactionStatus:  transactionStatus ? transactionStatus : {[Op.not]: null} 
                        }
                    ]
                },
                include: 
                [
                    {
                        model: database.room,
                        attributes: [],
                        required: true,
                        include: [{
                            model: database.property,
                            attributes: [],
                            where: {'tenantId': tenantId}
                        }]
                    },
                    {
                        model: database.user,
                        attributes: ['fullName', 'email'],
                        where: {
                            fullName: search ? {
                                [Op.like]: "%" + search + "%"
                            } : {[Op.not]: null} 
                        }
                    }
                ],
                group: ['room.property.tenantId'],
            })

            const totalRows = rows[0] ? rows[0].count : 0
            const totalPage = Math.ceil(totalRows / limit);
            console.log(totalPage)
              
            const data = await database.transaction.findAll({
                attributes: ['id', 'checkIn', 'checkOut', 'transactionStatus'],
                where: { 
                    [Op.and]: [
                        {
                            checkIn: startedDate ? {[Op.between]: [startedDate, endDate]} : {[Op.not]: null} 
                        },
                        {
                            transactionStatus:  transactionStatus ? transactionStatus : {[Op.not]: null} 
                        }
                    ]
                },
                include: 
                [
                    {
                        model: database.room,
                        attributes: ['name', 'price'],
                        include: [{
                            model: database.property,
                            attributes: ['tenantId', 'name'],
                        }],
                    },
                    {
                        model: database.user,
                        attributes: ['fullName', 'email'],
                        where: {
                            fullName: search ? {
                                [Op.like]: "%" + search + "%"
                            } : {[Op.not]: null} 
                        }
                    }
                ],
                having: {
                    [Op.and]: [
                        {'room.property.tenantId': tenantId },
                    ]
                },
                order: [
                    order === "name" ? [{ model: database.room }, order, order_direction] : 
                    order === "price" ? [{ model: database.room }, order, order_direction] : 
                    order === "fullName" ? [{ model: database.user }, order, order_direction] : 
                    [order, order_direction]
                ],
                limit: [+limit],
                offset: [offset]
            })

            const amount = await database.transaction.findAll({
                attributes: [
                    [Sequelize.fn('sum', Sequelize.col('room.price')), 'total_amount'],
                  ],
                where: { 
                    [Op.and]: [
                        {
                            checkIn: startedDate ? {[Op.between]: [startedDate, endDate]} : {[Op.not]: null} 
                        },
                        {
                            transactionStatus:  ['Menunggu Konfirmasi Pembayaran', 'Diproses']
                        }
                    ]
                },
                include: 
                [
                    {
                        model: database.room,
                        attributes: [],
                        include: [{
                            model: database.property,
                            attributes: [],
                            where: {
                                tenantId
                            }
                        }],
                    },
                ],
                group: ['room.property.tenantId'],
                having: {
                    [Op.and]: [
                        {'total_amount': {[Op.not]: null} },
                    ]
                },
              });

              const totalAmount = amount[0] ? +amount[0].dataValues.total_amount : 0
            
            res.status(201).send(
                { 
                    totalRows,
                    totalPage,
                    totalAmount,
                    data
                } 
            )
        }catch(err){
            console.log(err)
            res.status(404).send(err)
        }
    },
    reportGuestTransactions: async (req, res) => {
        const {tenantId, search, order, order_direction, limit, start, end, page} = req.query
        const startedDate = start ? new Date(start) : null
        const endDate = end ? new Date(end) : new Date(start)
        const offset = (page * limit) - limit
        console.log(req.query)
        try{
            const rows = await database.transaction.count({
                where: { 
                    [Op.and]: [
                        {
                            checkIn: startedDate ? {[Op.between]: [startedDate, endDate]} : {[Op.not]: null} 
                        },
                        {
                            transactionStatus: ['Menunggu Konfirmasi Pembayaran', 'Diproses']
                        }
                    ]
                },
                include: 
                [
                    {
                        model: database.room,
                        attributes: [],
                        include: [{
                            model: database.property,
                            attributes: [],
                            where: {
                                tenantId
                            }
                        }],
                        required: true
                    },
                    {
                        model: database.user,
                        attributes: ['fullName', 'email', 'photo'],
                        where: {
                            fullName: search ? {
                                [Op.like]: "%" + search + "%"
                            } : {[Op.not]: null} 
                        }
                    }
                ],
                group: ['userId', 'room.property.tenantId'],
            })

            const totalRows = rows.length
            const totalPage = Math.ceil(totalRows / limit);

            const data = await database.transaction.findAll({
                attributes: [ 'userId',
                    [Sequelize.fn('count', Sequelize.col('userId')), 'Count'], [Sequelize.fn('sum', Sequelize.col('room.price')), 'total_amount']
                  ],
                where: { 
                    [Op.and]: [
                        {
                            checkIn: startedDate ? {[Op.between]: [startedDate, endDate]} : {[Op.not]: null} 
                        },
                        {
                            transactionStatus: ['Menunggu Konfirmasi Pembayaran', 'Diproses']
                        }
                    ]
                },
                include: 
                [
                    {
                        model: database.room,
                        attributes: [],
                        include: [{
                            model: database.property,
                            attributes: [],
                            where: {
                                tenantId
                            }
                        }],
                        required: true
                    },
                    {
                        model: database.user,
                        attributes: ['fullName', 'email', 'photo'],
                        where: {
                            fullName: search ? {
                                [Op.like]: "%" + search + "%"
                            } : {[Op.not]: null} 
                        }
                    }
                ],
                group: ['userId', 'room.property.tenantId'],
                order: [
                    order === "fullName" ? [{ model: database.user }, order, order_direction] : 
                    [order, order_direction]
                ],
                limit: [+limit],
                offset: [offset]
              });
            

            
            res.status(201).send(
                { 
                    totalRows,
                    totalPage,
                    data
                } 
            )
        }catch(err){
            console.log(err)
            res.status(404).send(err)
        }
    },
    reportRoomsTransactions: async (req, res) => {
        const {tenantId, search, order, order_direction, limit, start, end, page, propertyname} = req.query
        const startedDate = start ? new Date(start) : null
        const endDate = end ? new Date(end) : new Date(start)
        const offset = (page * limit) - limit
        console.log(req.query)
        try{
            const rows = await database.transaction.count({
                where: { 
                    [Op.and]: [
                        {
                            checkIn: startedDate ? {[Op.between]: [startedDate, endDate]} : {[Op.not]: null} 
                        },
                        {
                            transactionStatus: ['Menunggu Konfirmasi Pembayaran', 'Diproses']
                        }
                    ]
                },
                include: 
                [
                    {
                        model: database.room,
                        attributes: ['name'],
                        include: [{
                            model: database.property,
                            attributes: ['name'],
                            where: {
                                [Op.and]: [
                                    {
                                        tenantId
                                    },
                                    {
                                        name: propertyname ? propertyname : {[Op.not]: null} 
                                    }
                                ]
                            }
                        }],
                        required: true
                    }
                ],
                group: ['room.id'],
            })

            const totalRows = rows.length
            const totalPage = Math.ceil(totalRows / limit);

            const data = await database.transaction.findAll({
                attributes: [ 
                    [Sequelize.fn('sum', Sequelize.col('room.price')), 'total_amount'],
                    [Sequelize.fn('count', Sequelize.col('room.name')), 'count'],
                  ],
                where: { 
                    [Op.and]: [
                        {
                            checkIn: startedDate ? {[Op.between]: [startedDate, endDate]} : {[Op.not]: null} 
                        },
                        {
                            transactionStatus: ['Menunggu Konfirmasi Pembayaran', 'Diproses']
                        }
                    ]
                },
                include: 
                [
                    {
                        model: database.room,
                        attributes: ['name'],
                        include: [{
                            model: database.property,
                            attributes: ['name'],
                            where: {
                                [Op.and]: [
                                    {
                                        tenantId
                                    },
                                    {
                                        name: propertyname ? propertyname : {[Op.not]: null} 
                                    }
                                ]
                            }
                        }],
                        required: true
                    }
                ],
                group: ['room.id'],
                order: [
                    order === "name" ? [{ model: database.room }, order, order_direction] : 
                    [order, order_direction]
                ],
                limit: [+limit],
                offset: [offset]
              });
              
              const property = await database.property.findAll({
                where: {tenantId},
                attributes: ['name']
              })

            
            res.status(201).send(
                { 
                    totalRows,
                    totalPage,
                    data,
                    property
                } 
            )
        }catch(err){
            console.log(err)
            res.status(404).send(err)
        }
    },
}