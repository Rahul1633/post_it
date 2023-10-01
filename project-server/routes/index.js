const express = require('express');
const request = require('request');
const router = express.Router();
const multer = require('multer');
const { Post } = require('../../models/schema');

const apiOptions = {
    server: "http://localhost:8000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://post-it-three-kappa.vercel.app';
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

const renderHomepage = (req, res, responseBody) => {
    res.render('index', {
        posts: responseBody
    });
};

router.get('/', (req, res, next) => {
    const path = '/posts';
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: {},
        qs: {}
    };
    request(
        requestOptions,
        (err, response, body) => {
            renderHomepage(req, res, body);
        }
    );
  // res.sendFile('login.html', { root: 'project-server/views' });
});

router.get('/posts', async(req, res) => {
    try {
        const data = await Post.find({})
            .then(function (posts) {
                res.status(200).json(posts);
            })
    } catch (err) {
        res.status(404).json(err);
    }
});

router.post('/post/new', upload.single('postImg'), async (req, res) => {
    console.log("here!!");
    const { postText } = req.body;
    console.log("here 2!!");
    try {
        // Assuming 'filename' property is added by multer to the request object
        const postImgPath = "./images/" + req.file.filename;
        await Post.create({ postText, postImg: postImgPath });
        res.status(200).redirect('/');
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;
