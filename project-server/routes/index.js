const express = require('express');
const request = require('request');
const router = express.Router();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('postit_resources');
const upload = require('../../middleware/multer');
const { Post } = require('../../models/schema');

const gcdpath = `https://storage.googleapis.com/postit_resources/images/`;

const apiOptions = {
    server: "http://localhost:8000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://post-it-three-kappa.vercel.app';
};



const renderHomepage = (req, res, responseBody) => {
    console.log(responseBody);
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

router.get('/posts', async (req, res) => {
    console.log("here");
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
    const { postText } = req.body;
    let imgSrcVar = { source: "NOT FOUND.png" };
    try {
        uploadFile(req, res, imgSrcVar);
        const postImgPath = gcdpath + imgSrcVar.source;
        await Post.create({ postText, postImg: postImgPath });
        res.status(200).redirect('/');
    } catch (err) {
        res.status(400).json(err);
    }
});

async function uploadFile(req, res, imgSrcVar) {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileName = "img-" + Math.random().toString(8) + ".jpeg";
    const gcsFileName = `images/${fileName}`;
    imgSrcVar.source = `${fileName}`;

    const stream = bucket.file(gcsFileName).createWriteStream({
        metadata: {
            contentType: file.mimetype,
        },
    });

    stream.on('error', (err) => {
        console.error(err);
        return res.status(500).send('Error uploading file to Google Cloud Storage.');
    });

    stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/postit_resources/${gcsFileName}`;
        console.log(`Images saved to ${publicUrl}`);
        res.status(200);
    });

    stream.end(file.buffer);
}

module.exports = router;
