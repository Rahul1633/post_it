const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Post } = require('../../models/schema');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.get('/', (req, res, next) => {
  res.render('index');
  // res.sendFile('login.html', { root: 'project-server/views' });
});

router.post('/post/new', upload.single('postImg'), async (req, res) => {
    const { postText } = req.body;

    try {
        // Assuming 'filename' property is added by multer to the request object
        const postImgPath = "./images/" + req.file.filename;

        const posted = await Post.create({ postText, postImg: postImgPath });
        res.status(200).redirect('/');
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;
