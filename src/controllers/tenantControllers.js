const database = require("../models")
const axios = require("axios")
const { sequelize } = require("../models")
const jwt = require("jsonwebtoken")

module.exports = {
    CreateFastility: async (req, res) => {
        try {
            await database.facility.create(req.body)
            res.status(201).send("Fasility Created")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    CreatePropertys: async (req, res) => {
        try {
            const { name, description, tenantId } = req.body

            if (!name) {
                return res.status(401).send('Name is required')
            }
            if (!description) {
                return res.status(401).send('Description is required')
            }
            if (description.length > 500) {
                return res.status(401).send('Description is required and must be less than 500 characters')
            }
            if (!req.file) {
                return res.status(401).send("Picture is required")
            }
            const CategoryId = await database.category.findOne({
                order: [['id', 'DESC']]
            })

            const newProperty = await database.property.create({
                name: name,
                description: description,
                picture: req.file.filename,
                tenantId: tenantId,
                categoryId: CategoryId.id
            })
            //add facilities to the property
            const latestFacility = await database.facility.findOne({
                order: [['id', 'DESC']]
            });
            const latestFacilityId = latestFacility.id;
            await database.propertyFacility.create({
                facilityId: latestFacilityId,
                propertyId: newProperty.id
            })
            res.status(200).send("propertyCreated")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    CreateCategory: async (req, res) => {
        try {
            const { country, province, city } = req.body

            if (!country) throw "Country is required"
            if (!province) throw "Province is required"
            if (!city) throw "City is required"

            const address = `${city}, ${province}, ${country}`
            const API_KEY = process.env.GEOCODE_API_KEY;
            const responses = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                    address
                )}&key=${API_KEY}`
            );
            const data = responses.data;
            const location = data.results[0].geometry;
            const lat = location.lat
            const lng = location.lng
            const result = [lat, lng];
            // ---------------------------------------------------------------------------

            const response = await database.category.create({
                country: country,
                province: province,
                city: city,
                locationDetail: { type: 'Point', coordinates: result }
            })
            res.status(200).send(response)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    createRoomData: async (req, res) => {
        try {
            const { name, description, price } = req.body
            const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

            if (!name) throw "Name is required"
            if (!description) throw "Description is required"
            if (!price) throw "Price is required"
            if (description.length > 300) throw 'Description is required and must be less than 500 characters'

            if (!req.file) {
                return res.status(401).send("Picture is required")
            }
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(401).send("Invalid file type. Only JPG, JPEG, WEBP and PNG are allowed.")
            }

            // Check file size
            if (req.file.size > 5000000) { // 5000000 bytes = 5MB
                return res.status(401).send("File size exceeds the allowed limit of 5MB.")
            }

            const propertyId = await database.property.findOne({
                where: {
                    name: req.query.name
                },
                raw: true
            })
            await database.room.create({
                name: name,
                description: description,
                price: price,
                picture: req.file.filename,
                propertyId: propertyId.id
            })
            res.status(200).send("Room created")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    createRoomOnBetenant: async (req, res) => {
        try {
            const { name, description, price } = req.body
            const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
            let propertyId;

            if (!name) throw "Name is required"
            if (!description) throw "Description is required"
            if (!price) throw "Price is required"
            if (description.length > 300) throw 'Description is required and must be less than 500 characters'

            if (!req.file) {
                return res.status(401).send("Picture is required")
            }
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(401).send("Invalid file type. Only JPG, JPEG, WEBP and PNG are allowed.")
            }

            if (req.file.size > 5000000) {
                return res.status(401).send("File size exceeds the allowed limit of 5MB.")
            }

            const getPropertyId = await database.property.findOne({
                where: {
                    tenantId: req.params.tenantId
                },
                order: [['id', 'DESC']]
            })

            if (getPropertyId.length > 1) {
                propertyId = getPropertyId[0].id + 1
            } else {
                propertyId = getPropertyId.id
            }

            await database.room.create({
                name: name,
                description: description,
                price: price,
                picture: req.file.filename,
                propertyId: propertyId
            })
            res.status(201).send("room created!")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    createManyImageinRoom: async (req, res) => {
        try {
            const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

            if (!req.file) {
                return res.status(401).send("Picture is required")
            }
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(401).send("Invalid file type. Only JPG, JPEG, WEBP and PNG are allowed.")
            }

            // Check file size
            if (req.file.size > 5000000) { // 5000000 bytes = 5MB
                return res.status(401).send("File size exceeds the allowed limit of 5MB.")
            }
            await database.image.create({
                name: req.file.filename,
                type: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                roomId: req.body.roomId
            })
            res.status(200).send("More picture success!")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    createMorePictureProperty: async (req, res) => {
        try {
            const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

            if (!req.file) {
                return res.status(401).send("Picture is required")
            }
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(401).send("Invalid file type. Only JPG, JPEG, WEBP and PNG are allowed.")
            }

            // Check file size
            if (req.file.size > 5000000) { // 5000000 bytes = 5MB
                return res.status(401).send("File size exceeds the allowed limit of 5MB.")
            }
            const getPropertyId = await database.property.findOne({
                where: {
                    id: req.params.id
                },
                raw: true
            })
            await database.propertypicture.create({
                name: req.file.filename,
                type: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                propertyId: getPropertyId.id
            })
            res.status(200).send("More picture on propertypicture success!")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    updatePictureProperty: async (req, res) => {
        try {
            if (!req.file) throw "Picture is required"
            const images = req.file.filename
            await database.property.update({
                picture: images
            }, {
                where: {
                    id: req.params.id
                }
            })
            res.status(200).send("Edited!")
        } catch (err) {
            console.log(err)
        }
    },
    updateNameProperty: async (req, res) => {
        try {
            const { name } = req.body
            if (!name) {
                return res.status(401).send("Name is Required")
            }
            await database.property.update({
                name: name
            }, {
                where: {
                    id: req.params.id
                }
            })
            res.status(200).send("Name edited!")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    updateFacility: async (req, res) => {
        try {
            const { name } = req.body
            if (!name) {
                return res.status(401).send("Facility is Required")
            }
            const data = await database.propertyFacility.findOne({
                where: {
                    propertyId: req.params.id
                }
            })
            await database.facility.update({
                name: name
            }, {
                where: {
                    id: data.facilityId
                }
            })
            res.status(200).send("Facility updated successfully")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    updateDescProperty: async (req, res) => {
        try {
            const { description } = req.body
            if (!description) {
                return res.status(401).send("Description is Required")
            }
            if (description.length > 500) {
                return res.status(401).send('Description is required and must be less than 500 characters')
            }
            await database.property.update({
                description: description
            }, {
                where: {
                    id: req.params.id
                }
            })
            res.status(200).send("Description updated")
        } catch (err) {
            console.log(err)
            res.status(401).send(err)
        }
    },
    updateLocationDetail: async (req, res) => {
        try {
            const { country, province, city } = req.body

            if (!country) throw "country is required"
            if (!province) throw "province is required"
            if (!city) throw "city is required"

            const address = `${city}, ${province}, ${country}`
            const API_KEY = process.env.GEOCODE_API_KEY;
            const responses = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                    address
                )}&key=${API_KEY}`
            );
            const dataGeocode = responses.data;
            const location = dataGeocode.results[0].geometry;
            const lat = location.lat
            const lng = location.lng
            const result = [lat, lng];

            await database.category.update({
                country: country,
                province: province,
                city: city,
                locationDetail: { type: 'Point', coordinates: result }
            }, {
                where: {
                    id: req.params.id
                }
            })
            res.status(200).send("Location detail updated")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    updateRoomProperty: async (req, res) => {
        try {
            const { name, description, price } = req.body
            const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

            if (!name) throw "Name is required"
            if (!description) throw "Description is required"
            if (description.length > 300) throw 'Description is required and must be less than 500 characters'
            if (!req.file) throw "picture is required"

            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(401).send("Invalid file type. Only JPG, JPEG, WEBP and PNG are allowed.")
            }

            // Check file size
            if (req.file.size > 5000000) { // 5000000 bytes = 5MB
                return res.status(401).send("File size exceeds the allowed limit of 5MB.")
            }

            await database.room.update({
                name: name,
                description: description,
                price: price,
                picture: req.file.filename,
            }, {
                where: {
                    id: req.params.id
                }
            })
            res.status(200).send("Rooms updated")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    deleteAllDataProperty: async (req, res) => {
        try {
            const { lanjutkan } = req.body

            const propertyId = await database.property.findOne({
                where: {
                    id: req.params.id
                }
            })

            const checkValidasiRoom = await database.room.findAll({
                attributes: ['id', 'name'],
                where: {
                    propertyId: propertyId.id
                },
                raw: true
            })

            const Room = checkValidasiRoom.map((item) => {
                return item.id
            })
            const Transactions = await database.transaction.findAll({
                attributes: ['roomId', 'checkIn', 'checkOut'],
                where: {
                    roomId: Room
                },
                raw: true
            })
            const checkTransactions = Transactions.map((item) => {
                return new Date(item.checkOut) > new Date()
            })
            const finalCheckTransactions = (checkTransactions.includes(true))
            if (finalCheckTransactions === true) throw "You cannot delete because there is a transaction in progress"

            if (lanjutkan === true) {
                await database.image.destroy({
                    where: {
                        roomId: Room
                    }
                })
                await database.unavailableDates.destroy({
                    where: {
                        roomId: Room
                    }
                })
                await database.highSeason.destroy({
                    where: {
                        roomId: Room
                    }
                })
            } else throw "Your room could be related to high seasons, unavailable date or a picture of your room that we have saved, proceed to delete it?"

            const propertyFacility = await database.propertyFacility.findOne({
                where: {
                    propertyId: propertyId.id
                }
            })
            await database.property.destroy({
                where: {
                    id: propertyId.id
                }
            })
            await database.category.destroy({
                where: {
                    id: propertyId.categoryId
                }
            })
            await database.propertypicture.destroy({
                where: {
                    propertyId: propertyId.id
                }
            })
            await database.propertyFacility.destroy({
                where: {
                    propertyId: propertyId.id
                }
            })

            await database.facility.destroy({
                where: {
                    id: propertyFacility.facilityId
                }
            })

            res.status(200).send("Property Deleted")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    deleteDataRooms: async (req, res) => {
        try {
            const Transactions = await database.transaction.findAll({
                attributes: ['roomId', 'checkIn', 'checkOut'],
                where: {
                    roomId: req.params.id
                },
                raw: true
            })
            const checkTransactions = Transactions.map(date => {
                return new Date(date.checkOut) > new Date()
            })
            if (checkTransactions.includes(true) === true) throw "transaction is in progress, cannot delete!"
            await database.image.destroy({
                where: {
                    roomId: req.params.id
                }
            })
            await database.unavailableDates.destroy({
                where: {
                    roomId: req.params.id
                }
            })
            await database.highSeason.destroy({
                where: {
                    roomId: req.params.id
                }
            })
            await database.room.destroy({
                where: {
                    id: req.params.id
                }
            })
            res.status(201).send("rooms deleted")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getAllDataProperty: async (req, res) => {
        try {
            const { orderByUser } = req.query
            console.log(orderByUser)
            const order = orderByUser === "ASC" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];
            const response = await database.property.findAll({
                where: { tenantId: req.params.tenantId },
                order,
                include: [
                    { model: database.category },
                    {
                        model: database.facility,
                        through: { attributes: [] }
                    },
                    {
                        model: database.room,
                        attributes: ['id', 'name'],
                        include: [
                            {
                                model: database.transaction,
                                attributes: ['roomId', 'transactionStatus']
                            }
                        ]
                    },
                    {
                        model: database.propertypicture,
                        attributes: [[sequelize.col('name'), 'picture']]
                    },
                ]
            })
            const data = response.map(item => {
                const newData = { ...item.dataValues, propertypictures: [{ picture: item.picture }, ...item.propertypictures] }
                delete newData.picture;
                return newData;
            });
            res.status(200).send(data)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getRoomPropertyById: async (req, res) => {
        try {
            const response = await database.room.findOne({
                where: {
                    id: req.params.id
                }
            })
            res.status(200).send(response)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getDataRoomAndImagesRoom: async (req, res) => {
        try {
            const response = await database.room.findAll({
                include: [{
                    model: database.image,
                    where: {
                        roomId: req.params.id
                    }
                }]
            })
            res.status(201).send(response)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getDataPropertyAndImagesProperty: async (req, res) => {
        try {
            const response = await database.property.findAll({
                where: {
                    id: req.params.id
                }, include: [{
                    model: database.propertypicture
                }]
            })
            res.status(200).send(response)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    deleteRoomImages: async (req, res) => {
        try {
            await database.image.destroy({
                where: {
                    id: req.params.id
                }
            })
            res.status(201).send("Deleted!")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    deletePropertyImage: async (req, res) => {
        try {
            await database.propertypicture.destroy({
                where: {
                    id: req.params.id
                }
            })
            res.status(201).send("deleted")
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getAllDataRooms: async (req, res) => {
        try {
            const getPropertyAndRooms = await database.property.findAll({
                attributes: ["name", "id"],
                where: {
                    tenantId: req.params.tenantId,
                    name: req.query.name
                }, include: [
                    {
                        model: database.room,
                        include: [{
                            model: database.image,
                            attributes: [[sequelize.col('name'), 'picture']]
                        }, {
                            model: database.unavailableDates
                        }, {
                            model: database.highSeason
                        }]
                    }
                ]
            })
            res.status(200).send(getPropertyAndRooms)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getAllCategory: async (req, res) => {
        try {
            const category = await database.category.findAll({
                attributes: ['city', 'province'],
                group: ['city', 'province']
            });
            res.status(200).send(category)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getDescProperty: async (req, res) => {
        try {
            const response = await database.property.findOne({
                attributes: ["description"],
                where: {
                    id: req.params.id
                }
            })
            res.status(201).send(response)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getFacilityById: async (req, res) => {
        try {
            const response = await database.property.findOne({
                attributes: ["name"],
                include: [{
                    model: database.facility,
                    attributes: ["name"]
                }],
                where: {
                    id: req.params.id
                }
            });
            res.status(201).send(response);
        } catch (err) {
            console.log(err);
            res.status(404).send(err);
        }
    },
    getPropertyNamesByTenantId: async (req, res) => {
        try {
            const response = await database.property.findAll({
                attributes: ["name"],
                where: {
                    tenantId: req.params.tenantId
                }
            })
            res.status(200).send(response)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    getDescRoom: async (req, res) => {
        try {
            const response = await database.room.findOne({
                attributes: ["description"],
                where: {
                    id: req.params.id
                }
            })
            res.status(201).send(response)
        } catch (err) {
            console.log(err)
            res.status(404).send(err)
        }
    },
    logoutAsTenant: async (req, res) => {
        try {
            const { tenantId, email } = req.params
            const propertiess = await database.property.findAll({
                attributes: ['tenantId'],
                where: {
                    tenantId: tenantId
                },
                raw: true
            })
            if (propertiess.length > 0) throw "You have not deleted all of your property that has been registered on the holistay, please delete it first"
            await database.user.update({
                isTenant: false,
            }, {
                where: {
                    email: email
                }
            })
            await database.tenant.destroy({
                where: {
                    id: tenantId
                }
            })
            res.status(201).send("logout tenant success")
        } catch (err) {
            console.log(err)
            res.status(401).send(err)
        }
    }
}