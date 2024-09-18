const { Router } = require ('express');
const router = Router();
const bodyParser = require('body-parser');
const bizauthController = require ('../controller/bizauthController');
const loadPages = require ('../controller/loadPages');

// create application/json parser
const jsonParser = bodyParser.json();

router.get('/', loadPages.indexPage);

router.get('/bizsignUP', loadPages.bizsignUP);
router.get('/bizsignIn', loadPages.bizsignIn);


router.post('/bizregister', bizauthController.register);
router.post('/api/users/bizlogin', bizauthController.login);
router.get('/api/users/bizprofile', bizauthController.profile);

module.exports = router;