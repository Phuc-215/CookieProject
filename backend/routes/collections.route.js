const express = require('express');
const router = express.Router();
const controller = require('../controllers/collections.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { createCollectionSchema, updateCollectionSchema,editCollectionSchema } = require('../validations/collection.validation');
const { validate } = require('../middlewares/validate.middleware');

router.use(requireAuth);

router.get('/:id', controller.list);

router.get('/content/:id', controller.getOne)

router.post('/', validate(createCollectionSchema), controller.create);

router.post('/content/:id', validate(updateCollectionSchema), controller.addToCollection);

router.put('/:id', validate(editCollectionSchema), controller.update);

module.exports = router;