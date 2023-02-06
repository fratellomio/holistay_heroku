const router = require('express').Router();
const verifyJWT = require('../middlewares/verifyJWT');

const { tenantControllers } = require('../controllers');
const { multerUpload } = require('../middlewares/multerProperty');
const { roomUpload } = require('../middlewares/multerRoom');

// router.get('/', (req, res) => {
//   res.status(200).send('home');
// });

//post
router.post('/api/betenant', verifyJWT, tenantControllers.CreateFastility);
router.post('/api/category', verifyJWT, tenantControllers.CreateCategory);
router.post(
  '/api/properties',
  verifyJWT,
  multerUpload.single('file'),
  tenantControllers.CreatePropertys
);
router.post(
  '/api/room',
  verifyJWT,
  roomUpload.single('file'),
  tenantControllers.createRoomData
);
router.post(
  '/api/roomOnBeTenant/:tenantId',
  verifyJWT,
  roomUpload.single('file'),
  tenantControllers.createRoomOnBetenant
);
router.post(
  '/api/addmanyimageroom',
  verifyJWT,
  roomUpload.single('file'),
  tenantControllers.createManyImageinRoom
);
router.post(
  '/api/createMorePictureProperty/:tenantId',
  verifyJWT,
  multerUpload.single('file'),
  tenantControllers.createMorePictureProperty
);

//get data
router.get('/api/property/:tenantId', tenantControllers.getAllDataProperty);
router.get('/api/roombyid/:id', tenantControllers.getRoomPropertyById);
router.get('/api/roomimages/:id', tenantControllers.getDataRoomAndImagesRoom);
router.get('/api/getAllDataRooms/:tenantId', tenantControllers.getAllDataRooms);
router.get(
  '/api/getmorePictureProperty/:tenantId',
  tenantControllers.getDataPropertyAndImagesProperty
);
router.get('/api/category', tenantControllers.getAllCategory);
router.get('/api/descProperty/:id', tenantControllers.getDescProperty);
router.get('/api/descRoom/:id', tenantControllers.getDescRoom);
router.get('/api/getFacilityById/:id', tenantControllers.getFacilityById);
router.get(
  '/api/getNamesProperty/:tenantId',
  tenantControllers.getPropertyNamesByTenantId
);

//update
router.patch(
  '/api/editpicture/:id',
  verifyJWT,
  multerUpload.single('file'),
  tenantControllers.updatePictureProperty
);
router.patch(
  '/api/editname/:id',
  verifyJWT,
  tenantControllers.updateNameProperty
);
router.patch(
  '/api/editfacility/:id',
  verifyJWT,
  tenantControllers.updateFacility
);
router.patch(
  '/api/editdescription/:id',
  verifyJWT,
  tenantControllers.updateDescProperty
);
router.patch(
  '/api/editlocation/:id',
  verifyJWT,
  tenantControllers.updateLocationDetail
);
router.patch(
  '/api/editroom/:id',
  verifyJWT,
  roomUpload.single('file'),
  tenantControllers.updateRoomProperty
);

//delete all data property
router.delete(
  '/api/deleteproperty/:id',
  verifyJWT,
  tenantControllers.deleteAllDataProperty
);
router.delete(
  '/api/deleteroom/:id',
  verifyJWT,
  tenantControllers.deleteDataRooms
);
router.delete(
  '/api/deleteroomimage/:id',
  verifyJWT,
  tenantControllers.deleteRoomImages
);
router.delete(
  '/api/deletepropertyimage/:id',
  verifyJWT,
  tenantControllers.deletePropertyImage
);
router.delete(
  '/api/logoutTenant/:tenantId/:email',
  tenantControllers.logoutAsTenant
);

module.exports = router;
